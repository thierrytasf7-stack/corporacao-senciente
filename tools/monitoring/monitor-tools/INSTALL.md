# 📦 Guia de Instalação Detalhado

## Instalação no Windows

### 1. Instalar Node.js

Baixe e instale o Node.js do site oficial: https://nodejs.org/
- Recomendado: versão LTS (Long Term Support)
- Durante a instalação, marque a opção "Add to PATH"

### 2. Instalar Visual Studio Build Tools (Opcional mas Recomendado)

A biblioteca `robotjs` precisa compilar código nativo. Para isso, você precisa do Visual Studio Build Tools:

**Opção A - Automática (Recomendada):**
```bash
npm install --global windows-build-tools
```

**Opção B - Manual:**
1. Baixe o Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
2. Durante a instalação, selecione "Desktop development with C++"
3. Instale e reinicie o computador

### 3. Instalar Dependências do Projeto

Abra o PowerShell ou CMD no diretório do projeto e execute:

```bash
npm install
```

Se encontrar erros com `robotjs`, tente:

```bash
npm install robotjs --build-from-source
```

Ou use uma versão pré-compilada:

```bash
npm install robotjs@0.6.0
```

### 4. Executar o Servidor

```bash
npm start
```

Ou para desenvolvimento com auto-reload:

```bash
npm run dev
```

## Solução de Problemas Comuns

### Erro: "robotjs.node is not a valid Win32 application"

**Solução:**
```bash
npm rebuild robotjs
```

### Erro: "Cannot find module 'robotjs'"

**Solução:**
```bash
npm install robotjs --save
npm rebuild robotjs
```

### Erro: "MSBuild não encontrado"

**Solução:**
Instale o Visual Studio Build Tools (veja passo 2 acima)

### Permissões Insuficientes

O `robotjs` precisa de permissões para controlar o mouse e teclado. Se não funcionar:

1. Execute o PowerShell como Administrador
2. Execute: `npm start`

### Firewall Bloqueando

Se não conseguir acessar de outro dispositivo:

1. Abra o Firewall do Windows
2. Permita a porta 3000 (ou a porta configurada)
3. Ou desative temporariamente o firewall para teste

## Testando a Instalação

1. Execute `npm start`
2. Abra o navegador em `http://localhost:3000`
3. Você deve ver a tela do seu computador
4. Tente mover o mouse e clicar - deve funcionar!

## Próximos Passos

Após a instalação bem-sucedida:

1. Configure o acesso remoto (veja README.md)
2. Configure segurança (autenticação, HTTPS)
3. Configure para acesso externo (túnel ou VPS)

