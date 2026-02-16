# Padrões de Arquitetura de Jogos

Uma base de conhecimento abrangente sobre os principais padrões arquiteturais utilizados no desenvolvimento de jogos.

## Índice

1. [Entity Component System (ECS)](#entity-component-system-ecs)
2. [Model-View-Controller (MVC)](#model-view-controller-mvc)
3. [Service Locator](#service-locator)
4. [Observer Pattern](#observer-pattern)
5. [State Machine](#state-machine)
6. [Object Pool](#object-pool)
7. [Game Loop](#game-loop)
8. [Behavioral Trees](#behavioral-trees)
9. [Command Pattern](#command-pattern)

---

## Entity Component System (ECS)

### Descrição
O ECS é um padrão arquitetural que separa dados (Components) de comportamento (Systems) e identidade (Entities). É especialmente útil para jogos com muitas entidades dinâmicas.

### Componentes Principais
- **Entity**: Um ID único que representa um objeto no jogo
- **Component**: Dados puros sem lógica (posição, velocidade, sprite, etc.)
- **System**: Lógica que opera sobre entidades com componentes específicos

### Vantagens
- Alta performance devido à organização de dados cache-friendly
- Flexibilidade para criar entidades complexas combinando componentes
- Facilita paralelização de sistemas
- Reduz acoplamento entre diferentes aspectos do jogo

### Desvantagens
- Curva de aprendizado íngreme
- Pode ser over-engineering para jogos simples
- Debugging pode ser mais complexo

### Exemplo de Implementação (C#)
```csharp
// Component
public struct Position
{
    public float X, Y;
}

public struct Velocity
{
    public float X, Y;
}

// System
public class MovementSystem
{
    public void Update(float deltaTime)
    {
        foreach (var entity in GetEntitiesWithComponents<Position, Velocity>())
        {
            ref var pos = ref GetComponent<Position>(entity);
            ref var vel = ref GetComponent<Velocity>(entity);
            
            pos.X += vel.X * deltaTime;
            pos.Y += vel.Y * deltaTime;
        }
    }
}
```

### Casos de Uso
- Jogos com muitas entidades (RTS, simuladores)
- Jogos que requerem alta performance
- Projetos que precisam de flexibilidade na composição de objetos

---

## Model-View-Controller (MVC)

### Descrição
O MVC separa a aplicação em três camadas: Model (dados), View (apresentação) e Controller (lógica de controle). Adaptado para jogos, ajuda a organizar código de UI e gameplay.

### Componentes Principais
- **Model**: Estado do jogo, dados dos jogadores, configurações
- **View**: Renderização, UI, efeitos visuais
- **Controller**: Input handling, lógica de gameplay, coordenação

### Vantagens
- Separação clara de responsabilidades
- Facilita testes unitários
- Permite múltiplas views para o mesmo model
- Manutenibilidade melhorada

### Desvantagens
- Pode introduzir overhead desnecessário
- Comunicação entre camadas pode ser complexa
- Nem sempre se adapta bem ao tempo real dos jogos

### Exemplo de Implementação (C#)
```csharp
// Model
public class PlayerModel
{
    public int Health { get; set; }
    public int Score { get; set; }
    public Vector3 Position { get; set; }
    
    public event Action<int> HealthChanged;
    
    public void TakeDamage(int damage)
    {
        Health -= damage;
        HealthChanged?.Invoke(Health);
    }
}

// View
public class PlayerView : MonoBehaviour
{
    [SerializeField] private Slider healthBar;
    [SerializeField] private Text scoreText;
    
    public void UpdateHealth(int health)
    {
        healthBar.value = health / 100f;
    }
    
    public void UpdateScore(int score)
    {
        scoreText.text = $"Score: {score}";
    }
}

// Controller
public class PlayerController
{
    private PlayerModel model;
    private PlayerView view;
    
    public PlayerController(PlayerModel model, PlayerView view)
    {
        this.model = model;
        this.view = view;
        
        model.HealthChanged += view.UpdateHealth;
    }
    
    public void HandleInput()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            model.TakeDamage(10);
        }
    }
}
```

### Casos de Uso
- Jogos com interfaces complexas
- Aplicações que precisam de múltiplas representações dos dados
- Projetos que requerem testes extensivos

---

## Service Locator

### Descrição
O Service Locator fornece um ponto central para acessar serviços globais do jogo, como audio manager, input manager, save system, etc.

### Componentes Principais
- **Service Interface**: Define o contrato do serviço
- **Service Implementation**: Implementação concreta do serviço
- **Service Locator**: Registry central que mantém referências aos serviços

### Vantagens
- Acesso fácil a serviços globais
- Desacoplamento entre clientes e implementações
- Facilita troca de implementações (útil para testes)
- Inicialização centralizada de serviços

### Desvantagens
- Pode mascarar dependências
- Debugging mais difícil
- Pode se tornar um "god object"
- Torna dependências implícitas

### Exemplo de Implementação (C#)
```csharp
// Service Interface
public interface IAudioService
{
    void PlaySound(string soundName);
    void PlayMusic(string musicName);
    void SetVolume(float volume);
}

// Service Implementation
public class AudioService : IAudioService
{
    public void PlaySound(string soundName)
    {
        // Implementação para tocar som
    }
    
    public void PlayMusic(string musicName)
    {
        // Implementação para tocar música
    }
    
    public void SetVolume(float volume)
    {
        // Implementação para ajustar volume
    }
}

// Service Locator
public static class ServiceLocator
{
    private static Dictionary<Type, object> services = new Dictionary<Type, object>();
    
    public static void RegisterService<T>(T service)
    {
        services[typeof(T)] = service;
    }
    
    public static T GetService<T>()
    {
        if (services.TryGetValue(typeof(T), out var service))
        {
            return (T)service;
        }
        throw new InvalidOperationException($"Service {typeof(T)} not registered");
    }
}

// Uso
public class GameManager : MonoBehaviour
{
    void Start()
    {
        ServiceLocator.RegisterService<IAudioService>(new AudioService());
    }
}

public class Player : MonoBehaviour
{
    void OnCollisionEnter(Collision collision)
    {
        ServiceLocator.GetService<IAudioService>().PlaySound("hit");
    }
}
```

### Casos de Uso
- Serviços globais (audio, input, save system)
- Sistemas que precisam ser acessados de qualquer lugar
- Quando dependency injection é muito complexo

---

## Observer Pattern

### Descrição
O Observer permite que objetos sejam notificados automaticamente sobre mudanças de estado em outros objetos, sem criar acoplamento forte entre eles.

### Componentes Principais
- **Subject**: Objeto que mantém lista de observers e os notifica
- **Observer**: Interface que define método de notificação
- **Concrete Observer**: Implementação específica que reage às notificações

### Vantagens
- Baixo acoplamento entre subject e observers
- Comunicação dinâmica entre objetos
- Facilita implementação de eventos
- Suporte a broadcast de notificações

### Desvantagens
- Pode causar vazamentos de memória se não gerenciado corretamente
- Ordem de notificação pode ser importante mas não garantida
- Debugging pode ser complexo com muitos observers

### Exemplo de Implementação (C#)
```csharp
// Observer Interface
public interface IGameEventObserver
{
    void OnNotify(GameEvent gameEvent);
}

// Subject
public class GameEventManager
{
    private List<IGameEventObserver> observers = new List<IGameEventObserver>();
    
    public void Subscribe(IGameEventObserver observer)
    {
        observers.Add(observer);
    }
    
    public void Unsubscribe(IGameEventObserver observer)
    {
        observers.Remove(observer);
    }
    
    public void NotifyObservers(GameEvent gameEvent)
    {
        foreach (var observer in observers)
        {
            observer.OnNotify(gameEvent);
        }
    }
}

// Game Event
public enum GameEventType
{
    PlayerDied,
    EnemyKilled,
    LevelCompleted
}

public class GameEvent
{
    public GameEventType Type { get; set; }
    public object Data { get; set; }
}

// Concrete Observer
public class ScoreManager : IGameEventObserver
{
    private int score = 0;
    
    public void OnNotify(GameEvent gameEvent)
    {
        switch (gameEvent.Type)
        {
            case GameEventType.EnemyKilled:
                score += 100;
                break;
            case GameEventType.LevelCompleted:
                score += 1000;
                break;
        }
    }
}

// Uso com C# Events (alternativa mais idiomática)
public class Player : MonoBehaviour
{
    public static event Action<int> OnHealthChanged;
    public static event Action OnPlayerDied;
    
    private int health = 100;
    
    public void TakeDamage(int damage)
    {
        health -= damage;
        OnHealthChanged?.Invoke(health);
        
        if (health <= 0)
        {
            OnPlayerDied?.Invoke();
        }
    }
}
```

### Casos de Uso
- Sistemas de eventos de jogo
- UI que precisa reagir a mudanças de estado
- Sistemas de conquistas/achievements
- Comunicação entre sistemas desacoplados

---

## State Machine

### Descrição
State Machine organiza comportamento em estados discretos com transições bem definidas. Muito útil para IA de personagens, estados de jogo e animações.

### Componentes Principais
- **State**: Representa um estado específico com comportamentos enter/update/exit
- **Transition**: Define condições para mudança entre estados
- **State Machine**: Gerencia estado atual e transições

### Vantagens
- Comportamento previsível e bem definido
- Fácil de debugar e visualizar
- Previne estados inválidos
- Facilita implementação de IA complexa

### Desvantagens
- Pode se tornar complexo com muitos estados
- Transições podem criar dependências circulares
- Não adequado para comportamentos paralelos

### Exemplo de Implementação (C#)
```csharp
// State Interface
public interface IState
{
    void Enter();
    void Update();
    void Exit();
}

// Concrete States
public class IdleState : IState
{
    private Enemy enemy;
    
    public IdleState(Enemy enemy)
    {
        this.enemy = enemy;
    }
    
    public void Enter()
    {
        enemy.SetAnimation("idle");
    }
    
    public void Update()
    {
        if (enemy.PlayerInRange())
        {
            enemy.StateMachine.ChangeState(new ChaseState(enemy));
        }
    }
    
    public void Exit()
    {
        // Cleanup se necessário
    }
}

public class ChaseState : IState
{
    private Enemy enemy;
    
    public ChaseState(Enemy enemy)
    {
        this.enemy = enemy;
    }
    
    public void Enter()
    {
        enemy.SetAnimation("run");
    }
    
    public void Update()
    {
        if (!enemy.PlayerInRange())
        {
            enemy.StateMachine.ChangeState(new IdleState(enemy));
        }
        else if (enemy.PlayerInAttackRange())
        {
            enemy.StateMachine.ChangeState(new AttackState(enemy));
        }
        else
        {
            enemy.MoveTowardsPlayer();
        }
    }
    
    public void Exit()
    {
        enemy.StopMovement();
    }
}

// State Machine
public class StateMachine
{
    private IState currentState;
    
    public void ChangeState(IState newState)
    {
        currentState?.Exit();
        currentState = newState;
        currentState?.Enter();
    }
    
    public void Update()
    {
        currentState?.Update();
    }
}

// Usage
public class Enemy : MonoBehaviour
{
    public StateMachine StateMachine { get; private set; }
    
    void Start()
    {
        StateMachine = new StateMachine();
        StateMachine.ChangeState(new IdleState(this));
    }
    
    void Update()
    {
        StateMachine.Update();
    }
}
```

### Casos de Uso
- IA de personagens (idle, patrol, chase, attack)
- Estados de jogo (menu, playing, paused, game over)
- Controle de animações
- Máquinas de estado de UI

---

## Object Pool

### Descrição
Object Pool reutiliza objetos caros de criar/destruir, mantendo um pool de objetos pré-alocados. Essencial para performance em jogos.

### Componentes Principais
- **Pool**: Container que mantém objetos disponíveis e em uso
- **Poolable Object**: Objeto que pode ser reutilizado
- **Pool Manager**: Gerencia múltiplos pools

### Vantagens
- Reduz garbage collection
- Melhora performance eliminando allocations
- Uso de memória mais previsível
- Reduz stuttering causado por GC

### Desvantagens
- Uso de memória inicial maior
- Complexidade adicional no código
- Objetos devem ser "resetáveis"
- Pode causar vazamentos se mal gerenciado

### Exemplo de Implementação (C#)
```csharp
// Poolable Object Interface
public interface IPoolable
{
    void OnSpawn();
    void OnDespawn();
}

// Generic Object Pool
public class ObjectPool<T> where T : MonoBehaviour, IPoolable
{
    private Queue<T> pool = new Queue<T>();
    private T prefab;
    private Transform parent;
    
    public ObjectPool(T prefab, int initialSize = 10, Transform parent = null)
    {
        this.prefab = prefab;
        this.parent = parent;
        
        // Pre-populate pool
        for (int i = 0; i < initialSize; i++)
        {
            T obj = Object.Instantiate(prefab, parent);
            obj.gameObject.SetActive(false);
            pool.Enqueue(obj);
        }
    }
    
    public T Get()
    {
        T obj;
        
        if (pool.Count > 0)
        {
            obj = pool.Dequeue();
        }
        else
        {
            obj = Object.Instantiate(prefab, parent);
        }
        
        obj.gameObject.SetActive(true);
        obj.OnSpawn();
        return obj;
    }
    
    public void Return(T obj)
    {
        obj.OnDespawn();
        obj.gameObject.SetActive(false);
        pool.Enqueue(obj);
    }
}

// Poolable Bullet Example
public class Bullet : MonoBehaviour, IPoolable
{
    private Rigidbody rb;
    private float lifetime = 5f;
    
    void Awake()
    {
        rb = GetComponent<Rigidbody>();
    }
    
    public void OnSpawn()
    {
        // Reset bullet state
        rb.velocity = Vector3.zero;
        StartCoroutine(LifetimeCoroutine());
    }
    
    public void OnDespawn()
    {
        // Cleanup
        StopAllCoroutines();
    }
    
    private IEnumerator LifetimeCoroutine()
    {
        yield return new WaitForSeconds(lifetime);
        BulletPool.Instance.Return(this);
    }
    
    void OnTriggerEnter(Collider other)
    {
        // Handle collision
        BulletPool.Instance.Return(this);
    }
}

// Pool Manager
public class BulletPool : MonoBehaviour
{
    public static BulletPool Instance { get; private set; }
    
    [SerializeField] private Bullet bulletPrefab;
    [SerializeField] private int poolSize = 50;
    
    private ObjectPool<Bullet> pool;
    
    void Awake()
    {
        Instance = this;
        pool = new ObjectPool<Bullet>(bulletPrefab, poolSize, transform);
    }
    
    public Bullet Get()
    {
        return pool.Get();
    }
    
    public void Return(Bullet bullet)
    {
        pool.Return(bullet);
    }
}
```

### Casos de Uso
- Projéteis e balas
- Efeitos de partículas
- Inimigos que respawnam
- Objetos de UI temporários
- Qualquer objeto criado/destruído frequentemente

---

## Game Loop

### Descrição
O Game Loop é o coração de qualquer jogo, controlando a sequência de update, render e timing. Define como o jogo processa input, atualiza estado e renderiza frames.

### Componentes Principais
- **Input Processing**: Captura e processa entrada do usuário
- **Update**: Atualiza lógica do jogo e estado
- **Render**: Desenha o frame atual
- **Timing**: Controla framerate e delta time

### Tipos de Game Loop

#### Fixed Timestep
```csharp
public class FixedTimestepGameLoop : MonoBehaviour
{
    private const float FIXED_TIMESTEP = 1f / 60f; // 60 FPS
    private float accumulator = 0f;
    
    void Update()
    {
        float frameTime = Time.unscaledDeltaTime;
        accumulator += frameTime;
        
        // Process input
        ProcessInput();
        
        // Fixed timestep updates
        while (accumulator >= FIXED_TIMESTEP)
        {
            UpdateGame(FIXED_TIMESTEP);
            accumulator -= FIXED_TIMESTEP;
        }
        
        // Render with interpolation
        float interpolation = accumulator / FIXED_TIMESTEP;
        Render(interpolation);
    }
}
```

#### Variable Timestep
```csharp
public class VariableTimestepGameLoop : MonoBehaviour
{
    void Update()
    {
        float deltaTime = Time.deltaTime;
        
        ProcessInput();
        UpdateGame(deltaTime);
        Render();
    }
}
```

### Vantagens
- Controle preciso sobre timing
- Determinismo (fixed timestep)
- Separação clara de responsabilidades
- Performance otimizada

### Desvantagens
- Complexidade adicional
- Pode ser over-engineering para jogos simples
- Requer cuidado com sincronização

### Exemplo Completo (C#)
```csharp
public class GameLoop : MonoBehaviour
{
    [Header("Timing")]
    [SerializeField] private int targetFPS = 60;
    [SerializeField] private bool useFixedTimestep = true;
    
    private float fixedTimestep;
    private float accumulator;
    private float maxFrameTime = 0.25f; // Prevent spiral of death
    
    // Game systems
    private InputSystem inputSystem;
    private PhysicsSystem physicsSystem;
    private GameplaySystem gameplaySystem;
    private RenderSystem renderSystem;
    
    void Start()
    {
        Application.targetFrameRate = targetFPS;
        fixedTimestep = 1f / targetFPS;
        
        InitializeSystems();
    }
    
    void Update()
    {
        float frameTime = Mathf.Min(Time.unscaledDeltaTime, maxFrameTime);
        
        if (useFixedTimestep)
        {
            FixedTimestepLoop(frameTime);
        }
        else
        {
            VariableTimestepLoop(frameTime);
        }
    }
    
    private void FixedTimestepLoop(float frameTime)
    {
        accumulator += frameTime;
        
        // Input is processed once per frame
        inputSystem.ProcessInput();
        
        // Game logic runs at fixed timestep
        while (accumulator >= fixedTimestep)
        {
            physicsSystem.Update(fixedTimestep);
            gameplaySystem.Update(fixedTimestep);
            accumulator -= fixedTimestep;
        }
        
        // Render with interpolation
        float interpolation = accumulator / fixedTimestep;
        renderSystem.Render(interpolation);
    }
    
    private void VariableTimestepLoop(float deltaTime)
    {
        inputSystem.ProcessInput();
        physicsSystem.Update(deltaTime);
        gameplaySystem.Update(deltaTime);
        renderSystem.Render(1f);
    }
    
    private void InitializeSystems()
    {
        inputSystem = new InputSystem();
        physicsSystem = new PhysicsSystem();
        gameplaySystem = new GameplaySystem();
        renderSystem = new RenderSystem();
    }
}
```

### Casos de Uso
- Todos os jogos precisam de algum tipo de game loop
- Jogos que requerem timing preciso (fighting games, rhythm games)
- Simulações que precisam de determinismo
- Jogos multiplayer que precisam de sincronização

---

## Behavioral Trees

### Descrição
Behavioral Trees são uma estrutura hierárquica para modelar comportamento de IA. Mais flexível que state machines para comportamentos complexos e dinâmicos.

### Componentes Principais
- **Leaf Nodes**: Actions e Conditions
- **Composite Nodes**: Sequence, Selector, Parallel
- **Decorator Nodes**: Modificam comportamento de child nodes

### Tipos de Nós

#### Composite Nodes
- **Sequence**: Executa filhos em ordem até um falhar
- **Selector**: Executa filhos até um ter sucesso
- **Parallel**: Executa múltiplos filhos simultaneamente

#### Decorator Nodes
- **Inverter**: Inverte resultado do filho
- **Repeater**: Repete execução do filho
- **Cooldown**: Adiciona delay entre execuções

### Vantagens
- Muito flexível e modular
- Fácil de visualizar e editar
- Reutilização de sub-árvores
- Comportamento emergente complexo

### Desvantagens
- Pode ser over-engineering para IA simples
- Performance pode ser inferior a state machines
- Curva de aprendizado

### Exemplo de Implementação (C#)
```csharp
// Base Node
public abstract class BehaviorNode
{
    public enum NodeState
    {
        Running,
        Success,
        Failure
    }
    
    public abstract NodeState Evaluate();
}

// Composite Nodes
public class Sequence : BehaviorNode
{
    private List<BehaviorNode> children = new List<BehaviorNode>();
    
    public Sequence(params BehaviorNode[] nodes)
    {
        children.AddRange(nodes);
    }
    
    public override NodeState Evaluate()
    {
        foreach (var child in children)
        {
            var result = child.Evaluate();
            
            if (result == NodeState.Failure)
                return NodeState.Failure;
                
            if (result == NodeState.Running)
                return NodeState.Running;
        }
        
        return NodeState.Success;
    }
}

public class Selector : BehaviorNode
{
    private List<BehaviorNode> children = new List<BehaviorNode>();
    
    public Selector(params BehaviorNode[] nodes)
    {
        children.AddRange(nodes);
    }
    
    public override NodeState Evaluate()
    {
        foreach (var child in children)
        {
            var result = child.Evaluate();
            
            if (result == NodeState.Success)
                return NodeState.Success;
                
            if (result == NodeState.Running)
                return NodeState.Running;
        }
        
        return NodeState.Failure;
    }
}

// Leaf Nodes
public class IsPlayerInRange : BehaviorNode
{
    private Enemy enemy;
    private float range;
    
    public IsPlayerInRange(Enemy enemy, float range)
    {
        this.enemy = enemy;
        this.range = range;
    }
    
    public override NodeState Evaluate()
    {
        float distance = Vector3.Distance(enemy.transform.position, enemy.Player.transform.position);
        return distance <= range ? NodeState.Success : NodeState.Failure;
    }
}

public class MoveToPlayer : BehaviorNode
{
    private Enemy enemy;
    
    public MoveToPlayer(Enemy enemy)
    {
        this.enemy = enemy;
    }
    
    public override NodeState Evaluate()
    {
        enemy.MoveTowards(enemy.Player.transform.position);
        return NodeState.Running;
    }
}

public class AttackPlayer : BehaviorNode
{
    private Enemy enemy;
    private float lastAttackTime;
    private float attackCooldown = 2f;
    
    public AttackPlayer(Enemy enemy)
    {
        this.enemy = enemy;
    }
    
    public override NodeState Evaluate()
    {
        if (Time.time - lastAttackTime < attackCooldown)
            return NodeState.Failure;
            
        enemy.Attack();
        lastAttackTime = Time.time;
        return NodeState.Success;
    }
}

// Decorator Node
public class Inverter : BehaviorNode
{
    private BehaviorNode child;
    
    public Inverter(BehaviorNode child)
    {
        this.child = child;
    }
    
    public override NodeState Evaluate()
    {
        var result = child.Evaluate();
        
        switch (result)
        {
            case NodeState.Success:
                return NodeState.Failure;
            case NodeState.Failure:
                return NodeState.Success;
            default:
                return result;
        }
    }
}

// Enemy AI using Behavior Tree
public class Enemy : MonoBehaviour
{
    public GameObject Player { get; private set; }
    private BehaviorNode behaviorTree;
    
    void Start()
    {
        Player = GameObject.FindGameObjectWithTag("Player");
        
        // Build behavior tree
        behaviorTree = new Selector(
            // Attack if player is close
            new Sequence(
                new IsPlayerInRange(this, 2f),
                new AttackPlayer(this)
            ),
            // Chase if player is in sight
            new Sequence(
                new IsPlayerInRange(this, 10f),
                new MoveToPlayer(this)
            ),
            // Patrol if player not found
            new PatrolBehavior(this)
        );
    }
    
    void Update()
    {
        behaviorTree.Evaluate();
    }
}
```

### Casos de Uso
- IA complexa de NPCs
- Comportamento de inimigos adaptativos
- Sistemas de decisão hierárquicos
- Qualquer lógica que pode ser representada como árvore

---

## Command Pattern

### Descrição
O Command Pattern encapsula uma solicitação como um objeto, permitindo parametrizar clientes com diferentes solicitações, enfileirar operações e implementar undo/redo.

### Componentes Principais
- **Command**: Interface que define método de execução
- **Concrete Command**: Implementação específica de um comando
- **Invoker**: Objeto que invoca comandos
- **Receiver**: Objeto que executa a ação real

### Vantagens
- Desacopla quem invoca de quem executa
- Permite undo/redo facilmente
- Possibilita macro commands (composição)
- Facilita logging e replay de ações

### Desvantagens
- Pode criar muitas classes pequenas
- Overhead para operações simples
- Complexidade adicional

### Exemplo de Implementação (C#)
```csharp
// Command Interface
public interface ICommand
{
    void Execute();
    void Undo();
}

// Concrete Commands
public class MoveCommand : ICommand
{
    private Transform target;
    private Vector3 direction;
    private Vector3 previousPosition;
    
    public MoveCommand(Transform target, Vector3 direction)
    {
        this.target = target;
        this.direction = direction;
    }
    
    public void Execute()
    {
        previousPosition = target.position;
        target.position += direction;
    }
    
    public void Undo()
    {
        target.position = previousPosition;
    }
}

public class AttackCommand : ICommand
{
    private Player player;
    private Enemy target;
    private int previousHealth;
    
    public AttackCommand(Player player, Enemy target)
    {
        this.player = player;
        this.target = target;
    }
    
    public void Execute()
    {
        previousHealth = target.Health;
        target.TakeDamage(player.AttackDamage);
    }
    
    public void Undo()
    {
        target.Health = previousHealth;
    }
}

// Macro Command
public class MacroCommand : ICommand
{
    private List<ICommand> commands = new List<ICommand>();
    
    public void AddCommand(ICommand command)
    {
        commands.Add(command);
    }
    
    public void Execute()
    {
        foreach (var command in commands)
        {
            command.Execute();
        }
    }
    
    public void Undo()
    {
        // Undo in reverse order
        for (int i = commands.Count - 1; i >= 0; i--)
        {
            commands[i].Undo();
        }
    }
}

// Command Manager (Invoker)
public class CommandManager
{
    private Stack<ICommand> undoStack = new Stack<ICommand>();
    private Stack<ICommand> redoStack = new Stack<ICommand>();
    
    public void ExecuteCommand(ICommand command)
    {
        command.Execute();
        undoStack.Push(command);
        redoStack.Clear(); // Clear redo stack when new command is executed
    }
    
    public void Undo()
    {
        if (undoStack.Count > 0)
        {
            var command = undoStack.Pop();
            command.Undo();
            redoStack.Push(command);
        }
    }
    
    public void Redo()
    {
        if (redoStack.Count > 0)
        {
            var command = redoStack.Pop();
            command.Execute();
            undoStack.Push(command);
        }
    }
}

// Input Handler
public class InputHandler : MonoBehaviour
{
    private CommandManager commandManager;
    private Player player;
    
    void Start()
    {
        commandManager = new CommandManager();
        player = GetComponent<Player>();
    }
    
    void Update()
    {
        // Movement commands
        if (Input.GetKeyDown(KeyCode.W))
        {
            var command = new MoveCommand(transform, Vector3.forward);
            commandManager.ExecuteCommand(command);
        }
        
        if (Input.GetKeyDown(KeyCode.S))
        {
            var command = new MoveCommand(transform, Vector3.back);
            commandManager.ExecuteCommand(command);
        }
        
        // Undo/Redo
        if (Input.GetKeyDown(KeyCode.Z) && Input.GetKey(KeyCode.LeftControl))
        {
            commandManager.Undo();
        }
        
        if (Input.GetKeyDown(KeyCode.Y) && Input.GetKey(KeyCode.LeftControl))
        {
            commandManager.Redo();
        }
    }
}

// Replay System
public class ReplaySystem
{
    private List<ICommand> recordedCommands = new List<ICommand>();
    private bool isRecording = false;
    private bool isReplaying = false;
    
    public void StartRecording()
    {
        isRecording = true;
        recordedCommands.Clear();
    }
    
    public void StopRecording()
    {
        isRecording = false;
    }
    
    public void RecordCommand(ICommand command)
    {
        if (isRecording)
        {
            recordedCommands.Add(command);
        }
    }
    
    public IEnumerator Replay()
    {
        isReplaying = true;
        
        foreach (var command in recordedCommands)
        {
            command.Execute();
            yield return new WaitForSeconds(0.1f); // Delay between commands
        }
        
        isReplaying = false;
    }
}
```

### Casos de Uso
- Sistemas de undo/redo
- Input handling flexível
- Replay systems
- Macro recording
- Network commands
- AI planning systems

---

## Conclusão

Estes padrões arquiteturais são ferramentas fundamentais para o desenvolvimento de jogos robustos e maintíveis. A escolha do padrão adequado depende dos requisitos específicos do projeto:

### Guia de Seleção Rápida

- **ECS**: Para jogos com muitas entidades e foco em performance
- **MVC**: Para jogos com UI complexa e necessidade de testes
- **Service Locator**: Para acesso a serviços globais
- **Observer**: Para comunicação desacoplada entre sistemas
- **State Machine**: Para comportamentos com estados bem definidos
- **Object Pool**: Para objetos criados/destruídos frequentemente
- **Game Loop**: Base fundamental de qualquer jogo
- **Behavioral Trees**: Para IA complexa e adaptativa
- **Command**: Para undo/redo e input handling flexível

### Boas Práticas

1. **Não use todos os padrões**: Escolha apenas os que resolvem problemas reais
2. **Comece simples**: Implemente padrões conforme a necessidade cresce
3. **Performance primeiro**: Em jogos, performance é crítica
4. **Teste regularmente**: Padrões devem facilitar, não complicar testes
5. **Documente decisões**: Explique por que escolheu cada padrão

### Recursos Adicionais

- **Livros**: "Game Programming Patterns" por Robert Nystrom
- **Documentação**: Unity/Unreal Engine architecture guides
- **Comunidade**: Game development forums e Discord servers
- **Exemplos**: Open source games no GitHub

Esta base de conhecimento deve ser atualizada conforme novos padrões emergem e as necessidades do projeto evoluem.
