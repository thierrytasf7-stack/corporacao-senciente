const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const screenshot = require('screenshot-desktop');
const robot = require('robotjs');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurações
const PORT = process.env.PORT || 3001;
const SCREEN_CAPTURE_INTERVAL = parseInt(process.env.SCREEN_CAPTURE_INTERVAL) || 100; // 10 FPS (100ms)
const VIRTUAL_MODE = process.env.VIRTUAL_MODE !== 'false'; // Modo virtual (não move mouse físico) - padrão: true
let screenCaptureInterval = null;
let connectedClients = 0;

// Obter dimensões da tela
const screenSize = robot.getScreenSize();
console.log(`Tela detectada: ${screenSize.width}x${screenSize.height}`);

// Função para capturar e enviar tela
async function captureAndSendScreen() {
  try {
    const img = await screenshot({ screen: 0 });
    io.emit('screen-data', {
      image: img.toString('base64'),
      width: screenSize.width,
      height: screenSize.height,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Erro ao capturar tela:', error);
  }
}

// Estado global do modo virtual (pode ser alterado dinamicamente)
let virtualModeEnabled = VIRTUAL_MODE;

// Sistema de bloqueio para evitar conflitos entre mouse físico e remoto
let isRemoteActionActive = false;
let remoteActionLockTimeout = null;
const REMOTE_ACTION_LOCK_DURATION = 50; // 50ms de bloqueio após ação remota

// Rastrear posição do mouse físico para detectar uso simultâneo
let lastPhysicalMousePos = null;
let physicalMouseCheckInterval = null;
let isPhysicalMouseActive = false;

// WebSocket connections
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`Cliente conectado. Total: ${connectedClients}`);

  // Iniciar captura de tela quando houver clientes conectados
  if (connectedClients === 1 && !screenCaptureInterval) {
    screenCaptureInterval = setInterval(captureAndSendScreen, SCREEN_CAPTURE_INTERVAL);
    console.log('Captura de tela iniciada');
  }

  // Enviar dimensões da tela e estado do modo virtual ao conectar
  socket.emit('screen-size', {
    width: screenSize.width,
    height: screenSize.height
  });
  socket.emit('virtual-mode-state', { enabled: virtualModeEnabled });

  // Receber toggle do modo virtual
  socket.on('toggle-virtual-mode', (data) => {
    virtualModeEnabled = data.enabled;
    console.log(`Modo Virtual: ${virtualModeEnabled ? 'ATIVADO' : 'DESATIVADO'}`);
    io.emit('virtual-mode-state', { enabled: virtualModeEnabled });

    // Iniciar monitoramento do mouse físico se modo virtual estiver ativo
    if (virtualModeEnabled && !physicalMouseCheckInterval) {
      startPhysicalMouseMonitoring();
    } else if (!virtualModeEnabled && physicalMouseCheckInterval) {
      stopPhysicalMouseMonitoring();
    }
  });

  // Monitorar mouse físico para detectar uso simultâneo
  function startPhysicalMouseMonitoring() {
    if (physicalMouseCheckInterval) return;

    lastPhysicalMousePos = robot.getMousePos();
    physicalMouseCheckInterval = setInterval(() => {
      try {
        const currentPos = robot.getMousePos();
        if (lastPhysicalMousePos) {
          const moved = Math.abs(currentPos.x - lastPhysicalMousePos.x) > 2 ||
            Math.abs(currentPos.y - lastPhysicalMousePos.y) > 2;

          if (moved && !isRemoteActionActive) {
            // Mouse físico foi movido (não por ação remota)
            isPhysicalMouseActive = true;
            setTimeout(() => {
              isPhysicalMouseActive = false;
            }, 100);
          }
        }
        lastPhysicalMousePos = currentPos;
      } catch (error) {
        // Ignorar erros
      }
    }, 10); // Verificar a cada 10ms
  }

  function stopPhysicalMouseMonitoring() {
    if (physicalMouseCheckInterval) {
      clearInterval(physicalMouseCheckInterval);
      physicalMouseCheckInterval = null;
    }
    isPhysicalMouseActive = false;
    lastPhysicalMousePos = null;
  }

  // Iniciar monitoramento se modo virtual estiver ativo
  if (virtualModeEnabled) {
    startPhysicalMouseMonitoring();
  }

  // Função para salvar e restaurar posição do mouse (modo virtual)
  function saveMousePosition() {
    if (!virtualModeEnabled) return null;
    try {
      return robot.getMousePos();
    } catch (error) {
      return null;
    }
  }

  function restoreMousePosition(savedPos) {
    if (!virtualModeEnabled || !savedPos) return;
    try {
      // Usar setImmediate para restaurar de forma assíncrona e rápida
      setImmediate(() => {
        try {
          robot.moveMouse(savedPos.x, savedPos.y);
        } catch (error) {
          // Ignorar erros
        }
      });
    } catch (error) {
      // Ignorar erros ao restaurar
    }
  }

  // Função para executar ação remota com bloqueio
  function executeRemoteAction(actionFn) {
    // Se o mouse físico estiver ativo, pular a ação para evitar conflito
    if (isPhysicalMouseActive && virtualModeEnabled) {
      return; // Ignorar ação remota se mouse físico estiver em uso
    }

    // Marcar que uma ação remota está ativa
    isRemoteActionActive = true;

    // Limpar timeout anterior se existir
    if (remoteActionLockTimeout) {
      clearTimeout(remoteActionLockTimeout);
    }

    // Executar a ação
    try {
      actionFn();
    } catch (error) {
      console.error('Erro ao executar ação remota:', error);
    }

    // Liberar o bloqueio após um curto período
    remoteActionLockTimeout = setTimeout(() => {
      isRemoteActionActive = false;
    }, REMOTE_ACTION_LOCK_DURATION);
  }

  // Função para clicar em coordenadas absolutas sem mover o cursor físico
  function clickAtAbsolutePosition(x, y, button, isDown = false, isUp = false) {
    if (!virtualModeEnabled) {
      // Modo normal: mover e clicar normalmente
      robot.moveMouse(x, y);
      if (isDown) {
        if (button === 'left') robot.mouseToggle('down', 'left');
        else if (button === 'right') robot.mouseToggle('down', 'right');
        else if (button === 'middle') robot.mouseToggle('down', 'middle');
      } else if (isUp) {
        if (button === 'left') robot.mouseToggle('up', 'left');
        else if (button === 'right') robot.mouseToggle('up', 'right');
        else if (button === 'middle') robot.mouseToggle('up', 'middle');
      } else {
        if (button === 'left') robot.mouseClick();
        else if (button === 'right') robot.mouseClick('right');
        else if (button === 'middle') robot.mouseClick('middle');
      }
      return;
    }

    // Modo virtual: salvar posição, executar ação, restaurar
    const savedPos = saveMousePosition();

    // Mover para a posição e executar ação de forma síncrona e rápida
    robot.moveMouse(x, y);

    // Pequeno delay para garantir que o movimento foi processado
    // Mas executar a ação imediatamente após
    if (isDown) {
      if (button === 'left') robot.mouseToggle('down', 'left');
      else if (button === 'right') robot.mouseToggle('down', 'right');
      else if (button === 'middle') robot.mouseToggle('down', 'middle');
    } else if (isUp) {
      if (button === 'left') robot.mouseToggle('up', 'left');
      else if (button === 'right') robot.mouseToggle('up', 'right');
      else if (button === 'middle') robot.mouseToggle('up', 'middle');
    } else {
      if (button === 'left') robot.mouseClick();
      else if (button === 'right') robot.mouseClick('right');
      else if (button === 'middle') robot.mouseClick('middle');
    }

    // Restaurar posição imediatamente
    if (savedPos) {
      // Usar process.nextTick para restaurar o mais rápido possível
      process.nextTick(() => {
        try {
          robot.moveMouse(savedPos.x, savedPos.y);
        } catch (error) {
          // Ignorar erros
        }
      });
    }
  }

  // Receber eventos de mouse
  socket.on('mouse-move', (data) => {
    try {
      const { x, y } = data;
      if (!virtualModeEnabled) {
        robot.moveMouse(x, y);
      }
      // No modo virtual, apenas ignoramos o movimento
      // O cursor físico não se move
    } catch (error) {
      console.error('Erro ao mover mouse:', error);
    }
  });

  socket.on('mouse-down', (data) => {
    executeRemoteAction(() => {
      const { x, y, button } = data;
      clickAtAbsolutePosition(x, y, button, true, false);
    });
  });

  socket.on('mouse-up', (data) => {
    executeRemoteAction(() => {
      const { x, y, button } = data;
      clickAtAbsolutePosition(x, y, button, false, true);
    });
  });

  socket.on('mouse-click', (data) => {
    executeRemoteAction(() => {
      const { x, y, button } = data;
      clickAtAbsolutePosition(x, y, button, false, false);
    });
  });

  socket.on('mouse-double-click', (data) => {
    executeRemoteAction(() => {
      const { x, y, button } = data;
      const savedPos = saveMousePosition();

      // Mover para a posição
      robot.moveMouse(x, y);

      // Executar duplo clique de forma otimizada
      if (button === 'left') {
        robot.mouseClick();
        // Pequeno delay entre os cliques (padrão do Windows é ~200ms)
        setTimeout(() => {
          robot.mouseClick();
          // Restaurar posição após o segundo clique
          if (savedPos) {
            process.nextTick(() => {
              try {
                robot.moveMouse(savedPos.x, savedPos.y);
              } catch (error) {
                // Ignorar erros
              }
            });
          }
        }, 50); // Delay menor para execução mais rápida
      } else if (button === 'right') {
        robot.mouseClick('right');
        setTimeout(() => {
          robot.mouseClick('right');
          if (savedPos) {
            process.nextTick(() => {
              try {
                robot.moveMouse(savedPos.x, savedPos.y);
              } catch (error) {
                // Ignorar erros
              }
            });
          }
        }, 50);
      } else if (button === 'middle') {
        robot.mouseClick('middle');
        setTimeout(() => {
          robot.mouseClick('middle');
          if (savedPos) {
            process.nextTick(() => {
              try {
                robot.moveMouse(savedPos.x, savedPos.y);
              } catch (error) {
                // Ignorar erros
              }
            });
          }
        }, 50);
      } else {
        // Se não restaurou ainda, restaurar agora
        if (savedPos) {
          process.nextTick(() => {
            try {
              robot.moveMouse(savedPos.x, savedPos.y);
            } catch (error) {
              // Ignorar erros
            }
          });
        }
      }
    });
  });

  socket.on('mouse-scroll', (data) => {
    executeRemoteAction(() => {
      const { x, y, deltaX, deltaY } = data;
      const savedPos = saveMousePosition();

      // Mover para a posição do scroll
      robot.moveMouse(x, y);

      // Executar o scroll
      robot.scrollMouse(deltaX, deltaY);

      // Restaurar posição original do mouse (modo virtual)
      if (savedPos) {
        process.nextTick(() => {
          try {
            robot.moveMouse(savedPos.x, savedPos.y);
          } catch (error) {
            // Ignorar erros
          }
        });
      }
    });
  });

  socket.on('key-press', (data) => {
    try {
      const { key, modifiers } = data;
      if (modifiers && modifiers.length > 0) {
        robot.keyTap(key, modifiers);
      } else {
        robot.keyTap(key);
      }
    } catch (error) {
      console.error('Erro ao pressionar tecla:', error);
    }
  });

  socket.on('key-type', (data) => {
    try {
      const { text } = data;
      robot.typeString(text);
    } catch (error) {
      console.error('Erro ao digitar texto:', error);
    }
  });

  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`Cliente desconectado. Total: ${connectedClients}`);

    // Parar captura quando não houver clientes
    if (connectedClients === 0 && screenCaptureInterval) {
      clearInterval(screenCaptureInterval);
      screenCaptureInterval = null;
      console.log('Captura de tela parada');
    }

    // Parar monitoramento do mouse físico se não houver clientes
    if (connectedClients === 0) {
      stopPhysicalMouseMonitoring();
    }
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de status
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    clients: connectedClients,
    screenSize: screenSize
  });
});

// Armazenar último snapshot da tela (para API)
let lastScreenSnapshot = null;
let lastScreenSnapshotTimestamp = null;

// Rota para obter snapshot atual da tela (para IA)
app.get('/api/snapshot', async (req, res) => {
  try {
    const img = await screenshot({ screen: 0 });
    const base64 = img.toString('base64');
    lastScreenSnapshot = base64;
    lastScreenSnapshotTimestamp = Date.now();
    
    res.json({
      image: base64,
      format: 'base64',
      width: screenSize.width,
      height: screenSize.height,
      timestamp: lastScreenSnapshotTimestamp
    });
  } catch (error) {
    console.error('Erro ao capturar snapshot:', error);
    res.status(500).json({ error: 'Erro ao capturar snapshot' });
  }
});

// Rota para executar ação via API (para IA)
app.post('/api/action', (req, res) => {
  try {
    const { type, x, y, button, text, key, modifiers } = req.body;
    
    // Validar coordenadas
    if (x !== undefined && y !== undefined) {
      if (x < 0 || x >= screenSize.width || y < 0 || y >= screenSize.height) {
        return res.status(400).json({ error: 'Coordenadas inválidas' });
      }
    }
    
    // Executar ação baseada no tipo
    switch (type) {
      case 'click':
        robot.moveMouse(x, y);
        robot.mouseClick(button || 'left');
        break;
      case 'double-click':
        robot.moveMouse(x, y);
        robot.mouseClick();
        setTimeout(() => robot.mouseClick(), 50);
        break;
      case 'right-click':
        robot.moveMouse(x, y);
        robot.mouseClick('right');
        break;
      case 'type':
        robot.moveMouse(x || screenSize.width / 2, y || screenSize.height / 2);
        robot.typeString(text);
        break;
      case 'key':
        if (modifiers && modifiers.length > 0) {
          robot.keyTap(key, modifiers);
        } else {
          robot.keyTap(key);
        }
        break;
      case 'scroll':
        robot.moveMouse(x, y);
        robot.scrollMouse(0, (req.body.deltaY || 0) > 0 ? 3 : -3);
        break;
      default:
        return res.status(400).json({ error: 'Tipo de ação inválido' });
    }
    
    res.json({ success: true, timestamp: Date.now() });
  } catch (error) {
    console.error('Erro ao executar ação:', error);
    res.status(500).json({ error: 'Erro ao executar ação', message: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor de acesso remoto rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`🖥️  Tela: ${screenSize.width}x${screenSize.height}`);
  console.log(`🎮 Modo Virtual: ${virtualModeEnabled ? 'ATIVADO (mouse físico não se move)' : 'DESATIVADO (controle total)'}`);
  console.log(`💡 Use o toggle no cabeçalho para alternar o modo virtual`);
});

