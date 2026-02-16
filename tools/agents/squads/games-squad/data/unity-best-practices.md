# Unity Best Practices - Guia Completo

## Índice
1. [Otimização de Performance](#otimização-de-performance)
2. [Padrões C# para Unity](#padrões-c-para-unity)
3. [Networking](#networking)
4. [UI/UX](#uiux)
5. [Testes](#testes)
6. [Estrutura de Projeto](#estrutura-de-projeto)
7. [Asset Management](#asset-management)
8. [Debugging e Profiling](#debugging-e-profiling)

---

## Otimização de Performance

### CPU Optimization

#### Object Pooling
```csharp
public class ObjectPool<T> where T : MonoBehaviour
{
    private Queue<T> pool = new Queue<T>();
    private T prefab;
    private Transform parent;

    public ObjectPool(T prefab, int initialSize = 10, Transform parent = null)
    {
        this.prefab = prefab;
        this.parent = parent;
        
        for (int i = 0; i < initialSize; i++)
        {
            T obj = Object.Instantiate(prefab, parent);
            obj.gameObject.SetActive(false);
            pool.Enqueue(obj);
        }
    }

    public T Get()
    {
        if (pool.Count > 0)
        {
            T obj = pool.Dequeue();
            obj.gameObject.SetActive(true);
            return obj;
        }
        
        return Object.Instantiate(prefab, parent);
    }

    public void Return(T obj)
    {
        obj.gameObject.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

#### Evitar Allocations no Update
```csharp
// ❌ Ruim - cria garbage a cada frame
void Update()
{
    string status = "Health: " + health.ToString();
    Vector3 direction = target.position - transform.position;
}

// ✅ Bom - cache e reutilize
private StringBuilder statusBuilder = new StringBuilder();
private Vector3 cachedDirection;

void Update()
{
    statusBuilder.Clear();
    statusBuilder.Append("Health: ").Append(health);
    
    cachedDirection = target.position - transform.position;
}
```

#### Coroutines Eficientes
```csharp
// ❌ Ruim - cria WaitForSeconds a cada iteração
IEnumerator BadCoroutine()
{
    while (true)
    {
        yield return new WaitForSeconds(1f);
        DoSomething();
    }
}

// ✅ Bom - cache WaitForSeconds
private WaitForSeconds oneSecond = new WaitForSeconds(1f);

IEnumerator GoodCoroutine()
{
    while (true)
    {
        yield return oneSecond;
        DoSomething();
    }
}
```

### GPU Optimization

#### Batching
```csharp
// Use GPU Instancing para objetos similares
[System.Serializable]
public class InstancedRenderer
{
    public Mesh mesh;
    public Material material;
    public Matrix4x4[] matrices;
    
    public void Render()
    {
        Graphics.DrawMeshInstanced(mesh, 0, material, matrices);
    }
}
```

#### LOD (Level of Detail)
```csharp
public class LODController : MonoBehaviour
{
    [System.Serializable]
    public class LODLevel
    {
        public float distance;
        public GameObject model;
        public int textureSize;
    }
    
    public LODLevel[] lodLevels;
    private Camera playerCamera;
    private int currentLOD = -1;
    
    void Update()
    {
        float distance = Vector3.Distance(transform.position, playerCamera.transform.position);
        int newLOD = GetLODLevel(distance);
        
        if (newLOD != currentLOD)
        {
            SwitchLOD(newLOD);
        }
    }
}
```

### Memory Management

#### Asset Loading Assíncrono
```csharp
public class AssetLoader : MonoBehaviour
{
    public async Task<T> LoadAssetAsync<T>(string path) where T : Object
    {
        var request = Resources.LoadAsync<T>(path);
        
        while (!request.isDone)
        {
            await Task.Yield();
        }
        
        return request.asset as T;
    }
    
    public void UnloadUnusedAssets()
    {
        Resources.UnloadUnusedAssets();
        System.GC.Collect();
    }
}
```

---

## Padrões C# para Unity

### Singleton Pattern
```csharp
public class GameManager : MonoBehaviour
{
    private static GameManager instance;
    public static GameManager Instance
    {
        get
        {
            if (instance == null)
            {
                instance = FindObjectOfType<GameManager>();
                if (instance == null)
                {
                    GameObject go = new GameObject("GameManager");
                    instance = go.AddComponent<GameManager>();
                    DontDestroyOnLoad(go);
                }
            }
            return instance;
        }
    }
    
    private void Awake()
    {
        if (instance != null && instance != this)
        {
            Destroy(gameObject);
            return;
        }
        
        instance = this;
        DontDestroyOnLoad(gameObject);
    }
}
```

### Observer Pattern com Events
```csharp
public class HealthSystem : MonoBehaviour
{
    public event System.Action<float> OnHealthChanged;
    public event System.Action OnDeath;
    
    [SerializeField] private float maxHealth = 100f;
    private float currentHealth;
    
    public float Health
    {
        get => currentHealth;
        private set
        {
            currentHealth = Mathf.Clamp(value, 0, maxHealth);
            OnHealthChanged?.Invoke(currentHealth);
            
            if (currentHealth <= 0)
            {
                OnDeath?.Invoke();
            }
        }
    }
    
    public void TakeDamage(float damage)
    {
        Health -= damage;
    }
    
    public void Heal(float amount)
    {
        Health += amount;
    }
}
```

### Command Pattern
```csharp
public interface ICommand
{
    void Execute();
    void Undo();
}

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

public class CommandManager : MonoBehaviour
{
    private Stack<ICommand> commandHistory = new Stack<ICommand>();
    
    public void ExecuteCommand(ICommand command)
    {
        command.Execute();
        commandHistory.Push(command);
    }
    
    public void UndoLastCommand()
    {
        if (commandHistory.Count > 0)
        {
            ICommand command = commandHistory.Pop();
            command.Undo();
        }
    }
}
```

### State Machine
```csharp
public abstract class State
{
    public abstract void Enter();
    public abstract void Update();
    public abstract void Exit();
}

public class StateMachine
{
    private State currentState;
    
    public void ChangeState(State newState)
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

// Exemplo de uso
public class PlayerIdleState : State
{
    private PlayerController player;
    
    public PlayerIdleState(PlayerController player)
    {
        this.player = player;
    }
    
    public override void Enter()
    {
        player.animator.SetBool("IsIdle", true);
    }
    
    public override void Update()
    {
        if (Input.GetAxis("Horizontal") != 0 || Input.GetAxis("Vertical") != 0)
        {
            player.stateMachine.ChangeState(new PlayerMoveState(player));
        }
    }
    
    public override void Exit()
    {
        player.animator.SetBool("IsIdle", false);
    }
}
```

### ScriptableObject para Configurações
```csharp
[CreateAssetMenu(fileName = "WeaponData", menuName = "Game/Weapon Data")]
public class WeaponData : ScriptableObject
{
    [Header("Basic Stats")]
    public string weaponName;
    public float damage;
    public float fireRate;
    public float range;
    
    [Header("Audio")]
    public AudioClip fireSound;
    public AudioClip reloadSound;
    
    [Header("Visual")]
    public GameObject muzzleFlash;
    public GameObject projectilePrefab;
    
    public void Fire(Transform firePoint)
    {
        // Lógica de disparo usando os dados configurados
        GameObject projectile = Instantiate(projectilePrefab, firePoint.position, firePoint.rotation);
        // ... resto da implementação
    }
}
```

---

## Networking

### Mirror Networking Basics
```csharp
using Mirror;

public class NetworkPlayer : NetworkBehaviour
{
    [SyncVar(hook = nameof(OnHealthChanged))]
    public float health = 100f;
    
    [SyncVar]
    public string playerName;
    
    // Apenas o servidor pode executar
    [Server]
    public void TakeDamage(float damage)
    {
        health -= damage;
        if (health <= 0)
        {
            RpcPlayerDied();
        }
    }
    
    // Executado em todos os clientes
    [ClientRpc]
    void RpcPlayerDied()
    {
        // Animação de morte, efeitos, etc.
        gameObject.SetActive(false);
    }
    
    // Hook para mudanças no SyncVar
    void OnHealthChanged(float oldHealth, float newHealth)
    {
        UpdateHealthUI(newHealth);
    }
    
    // Comando do cliente para o servidor
    [Command]
    void CmdFireWeapon(Vector3 direction)
    {
        // Validação no servidor
        if (CanFire())
        {
            FireProjectile(direction);
        }
    }
}
```

### Network Manager Customizado
```csharp
public class CustomNetworkManager : NetworkManager
{
    [Header("Game Settings")]
    public int maxPlayersPerRoom = 4;
    public GameObject[] playerPrefabs;
    
    public override void OnServerAddPlayer(NetworkConnectionToClient conn)
    {
        // Escolher prefab baseado em preferências do jogador
        GameObject playerPrefab = playerPrefabs[0]; // Lógica de seleção
        
        // Spawn em posição específica
        Vector3 spawnPosition = GetSpawnPosition();
        GameObject player = Instantiate(playerPrefab, spawnPosition, Quaternion.identity);
        
        NetworkServer.AddPlayerForConnection(conn, player);
    }
    
    public override void OnClientConnect()
    {
        base.OnClientConnect();
        Debug.Log("Conectado ao servidor!");
    }
    
    public override void OnServerDisconnect(NetworkConnectionToClient conn)
    {
        base.OnServerDisconnect(conn);
        // Cleanup quando jogador desconecta
    }
}
```

### Lag Compensation
```csharp
public class LagCompensation : NetworkBehaviour
{
    [System.Serializable]
    public struct StateSnapshot
    {
        public Vector3 position;
        public Quaternion rotation;
        public float timestamp;
    }
    
    private Queue<StateSnapshot> stateHistory = new Queue<StateSnapshot>();
    private const float HISTORY_LENGTH = 1f; // 1 segundo de histórico
    
    void Update()
    {
        if (isServer)
        {
            // Armazenar estado atual
            StateSnapshot snapshot = new StateSnapshot
            {
                position = transform.position,
                rotation = transform.rotation,
                timestamp = Time.time
            };
            
            stateHistory.Enqueue(snapshot);
            
            // Limpar histórico antigo
            while (stateHistory.Count > 0 && 
                   Time.time - stateHistory.Peek().timestamp > HISTORY_LENGTH)
            {
                stateHistory.Dequeue();
            }
        }
    }
    
    public StateSnapshot GetStateAtTime(float timestamp)
    {
        foreach (var state in stateHistory)
        {
            if (Mathf.Abs(state.timestamp - timestamp) < 0.1f)
            {
                return state;
            }
        }
        
        return new StateSnapshot(); // Estado padrão se não encontrado
    }
}
```

---

## UI/UX

### UI Manager Pattern
```csharp
public class UIManager : MonoBehaviour
{
    [System.Serializable]
    public class UIPanel
    {
        public string name;
        public GameObject panel;
        public bool isActive;
    }
    
    public UIPanel[] panels;
    private Dictionary<string, UIPanel> panelDict;
    private Stack<string> panelHistory = new Stack<string>();
    
    void Start()
    {
        panelDict = new Dictionary<string, UIPanel>();
        foreach (var panel in panels)
        {
            panelDict[panel.name] = panel;
            panel.panel.SetActive(panel.isActive);
        }
    }
    
    public void ShowPanel(string panelName, bool addToHistory = true)
    {
        if (panelDict.ContainsKey(panelName))
        {
            // Esconder painel atual
            string currentPanel = GetCurrentActivePanel();
            if (!string.IsNullOrEmpty(currentPanel) && addToHistory)
            {
                panelHistory.Push(currentPanel);
            }
            
            HideAllPanels();
            panelDict[panelName].panel.SetActive(true);
            panelDict[panelName].isActive = true;
        }
    }
    
    public void GoBack()
    {
        if (panelHistory.Count > 0)
        {
            string previousPanel = panelHistory.Pop();
            ShowPanel(previousPanel, false);
        }
    }
    
    private void HideAllPanels()
    {
        foreach (var panel in panelDict.Values)
        {
            panel.panel.SetActive(false);
            panel.isActive = false;
        }
    }
}
```

### Responsive UI System
```csharp
public class ResponsiveUI : MonoBehaviour
{
    [System.Serializable]
    public class BreakPoint
    {
        public float screenWidth;
        public Vector2 anchorMin;
        public Vector2 anchorMax;
        public Vector2 offsetMin;
        public Vector2 offsetMax;
    }
    
    public BreakPoint[] breakPoints;
    private RectTransform rectTransform;
    private float lastScreenWidth;
    
    void Start()
    {
        rectTransform = GetComponent<RectTransform>();
        lastScreenWidth = Screen.width;
        UpdateLayout();
    }
    
    void Update()
    {
        if (Mathf.Abs(Screen.width - lastScreenWidth) > 10f)
        {
            lastScreenWidth = Screen.width;
            UpdateLayout();
        }
    }
    
    void UpdateLayout()
    {
        BreakPoint currentBreakPoint = GetCurrentBreakPoint();
        if (currentBreakPoint != null)
        {
            rectTransform.anchorMin = currentBreakPoint.anchorMin;
            rectTransform.anchorMax = currentBreakPoint.anchorMax;
            rectTransform.offsetMin = currentBreakPoint.offsetMin;
            rectTransform.offsetMax = currentBreakPoint.offsetMax;
        }
    }
    
    BreakPoint GetCurrentBreakPoint()
    {
        for (int i = breakPoints.Length - 1; i >= 0; i--)
        {
            if (Screen.width >= breakPoints[i].screenWidth)
            {
                return breakPoints[i];
            }
        }
        return breakPoints[0];
    }
}
```

### Animation System
```csharp
public class UIAnimator : MonoBehaviour
{
    public enum AnimationType
    {
        FadeIn, FadeOut, SlideIn, SlideOut, Scale, Bounce
    }
    
    public static void AnimateUI(GameObject target, AnimationType type, float duration = 0.3f, System.Action onComplete = null)
    {
        switch (type)
        {
            case AnimationType.FadeIn:
                FadeIn(target, duration, onComplete);
                break;
            case AnimationType.SlideIn:
                SlideIn(target, duration, onComplete);
                break;
            // ... outros tipos
        }
    }
    
    static void FadeIn(GameObject target, float duration, System.Action onComplete)
    {
        CanvasGroup canvasGroup = target.GetComponent<CanvasGroup>();
        if (canvasGroup == null)
            canvasGroup = target.AddComponent<CanvasGroup>();
        
        canvasGroup.alpha = 0f;
        target.SetActive(true);
        
        LeanTween.alphaCanvas(canvasGroup, 1f, duration)
                 .setEaseOutQuart()
                 .setOnComplete(onComplete);
    }
    
    static void SlideIn(GameObject target, float duration, System.Action onComplete)
    {
        RectTransform rect = target.GetComponent<RectTransform>();
        Vector3 originalPos = rect.anchoredPosition;
        rect.anchoredPosition = new Vector3(-Screen.width, originalPos.y, originalPos.z);
        
        target.SetActive(true);
        
        LeanTween.move(rect, originalPos, duration)
                 .setEaseOutBack()
                 .setOnComplete(onComplete);
    }
}
```

### Accessibility Features
```csharp
public class AccessibilityManager : MonoBehaviour
{
    [Header("Text Settings")]
    public float baseFontSize = 16f;
    public float fontSizeMultiplier = 1f;
    
    [Header("Color Settings")]
    public bool highContrastMode = false;
    public ColorScheme normalColors;
    public ColorScheme highContrastColors;
    
    [System.Serializable]
    public class ColorScheme
    {
        public Color backgroundColor;
        public Color textColor;
        public Color buttonColor;
        public Color accentColor;
    }
    
    void Start()
    {
        LoadAccessibilitySettings();
        ApplySettings();
    }
    
    public void SetFontSizeMultiplier(float multiplier)
    {
        fontSizeMultiplier = multiplier;
        UpdateAllTextSizes();
        SaveAccessibilitySettings();
    }
    
    public void ToggleHighContrast()
    {
        highContrastMode = !highContrastMode;
        ApplyColorScheme();
        SaveAccessibilitySettings();
    }
    
    void UpdateAllTextSizes()
    {
        Text[] allTexts = FindObjectsOfType<Text>();
        foreach (Text text in allTexts)
        {
            text.fontSize = Mathf.RoundToInt(baseFontSize * fontSizeMultiplier);
        }
    }
    
    void ApplyColorScheme()
    {
        ColorScheme scheme = highContrastMode ? highContrastColors : normalColors;
        
        // Aplicar cores a todos os elementos UI
        Image[] images = FindObjectsOfType<Image>();
        foreach (Image img in images)
        {
            if (img.CompareTag("Background"))
                img.color = scheme.backgroundColor;
            else if (img.CompareTag("Button"))
                img.color = scheme.buttonColor;
        }
    }
}
```

---

## Testes

### Unit Testing Setup
```csharp
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using System.Collections;

public class PlayerHealthTests
{
    private GameObject playerObject;
    private HealthSystem healthSystem;
    
    [SetUp]
    public void Setup()
    {
        playerObject = new GameObject("TestPlayer");
        healthSystem = playerObject.AddComponent<HealthSystem>();
    }
    
    [TearDown]
    public void Teardown()
    {
        Object.DestroyImmediate(playerObject);
    }
    
    [Test]
    public void TakeDamage_ReducesHealth()
    {
        // Arrange
        float initialHealth = healthSystem.Health;
        float damage = 25f;
        
        // Act
        healthSystem.TakeDamage(damage);
        
        // Assert
        Assert.AreEqual(initialHealth - damage, healthSystem.Health);
    }
    
    [Test]
    public void TakeDamage_WhenHealthReachesZero_TriggersDeathEvent()
    {
        // Arrange
        bool deathEventTriggered = false;
        healthSystem.OnDeath += () => deathEventTriggered = true;
        
        // Act
        healthSystem.TakeDamage(healthSystem.Health);
        
        // Assert
        Assert.IsTrue(deathEventTriggered);
    }
    
    [Test]
    public void Heal_IncreasesHealth()
    {
        // Arrange
        healthSystem.TakeDamage(50f);
        float healthBeforeHeal = healthSystem.Health;
        float healAmount = 25f;
        
        // Act
        healthSystem.Heal(healAmount);
        
        // Assert
        Assert.AreEqual(healthBeforeHeal + healAmount, healthSystem.Health);
    }
}
```

### Integration Testing
```csharp
public class GameplayIntegrationTests
{
    [UnityTest]
    public IEnumerator Player_CanMoveAndCollectItems()
    {
        // Arrange
        var testScene = SceneManager.CreateScene("TestScene");
        SceneManager.SetActiveScene(testScene);
        
        var playerGO = new GameObject("Player");
        var player = playerGO.AddComponent<PlayerController>();
        
        var itemGO = new GameObject("Item");
        var item = itemGO.AddComponent<CollectibleItem>();
        item.value = 10;
        
        // Position player and item
        playerGO.transform.position = Vector3.zero;
        itemGO.transform.position = Vector3.right * 2f;
        
        // Act
        player.MoveTowards(itemGO.transform.position);
        
        // Wait for movement to complete
        yield return new WaitForSeconds(2f);
        
        // Assert
        Assert.IsTrue(Vector3.Distance(playerGO.transform.position, itemGO.transform.position) < 0.1f);
        Assert.AreEqual(10, player.Score);
    }
    
    [UnityTest]
    public IEnumerator Combat_PlayerVsEnemy_WorksCorrectly()
    {
        // Setup combat scenario
        var player = CreateTestPlayer();
        var enemy = CreateTestEnemy();
        
        float playerInitialHealth = player.GetComponent<HealthSystem>().Health;
        float enemyInitialHealth = enemy.GetComponent<HealthSystem>().Health;
        
        // Simulate combat
        player.GetComponent<WeaponSystem>().Attack(enemy);
        yield return new WaitForSeconds(0.1f);
        
        enemy.GetComponent<WeaponSystem>().Attack(player);
        yield return new WaitForSeconds(0.1f);
        
        // Verify damage was dealt
        Assert.Less(player.GetComponent<HealthSystem>().Health, playerInitialHealth);
        Assert.Less(enemy.GetComponent<HealthSystem>().Health, enemyInitialHealth);
    }
}
```

### Performance Testing
```csharp
public class PerformanceTests
{
    [Test, Performance]
    public void ObjectPool_PerformsBetterThanInstantiate()
    {
        // Arrange
        var prefab = Resources.Load<GameObject>("TestPrefab");
        var pool = new ObjectPool<GameObject>(prefab, 100);
        
        // Measure Instantiate performance
        using (Measure.Method("Instantiate").WarmupCount(10).MeasurementCount(100))
        {
            for (int i = 0; i < 1000; i++)
            {
                var obj = Object.Instantiate(prefab);
                Object.DestroyImmediate(obj);
            }
        }
        
        // Measure Pool performance
        using (Measure.Method("ObjectPool").WarmupCount(10).MeasurementCount(100))
        {
            for (int i = 0; i < 1000; i++)
            {
                var obj = pool.Get();
                pool.Return(obj);
            }
        }
    }
    
    [Test, Performance]
    public void FindObjectOfType_vs_CachedReference()
    {
        // Setup
        var manager = new GameObject("Manager").AddComponent<GameManager>();
        
        // Test FindObjectOfType
        using (Measure.Method("FindObjectOfType").WarmupCount(5).MeasurementCount(50))
        {
            for (int i = 0; i < 1000; i++)
            {
                var found = Object.FindObjectOfType<GameManager>();
            }
        }
        
        // Test cached reference
        using (Measure.Method("CachedReference").WarmupCount(5).MeasurementCount(50))
        {
            for (int i = 0; i < 1000; i++)
            {
                var cached = GameManager.Instance;
            }
        }
    }
}
```

### Mock Testing
```csharp
public interface IDataService
{
    Task<PlayerData> LoadPlayerData(string playerId);
    Task SavePlayerData(PlayerData data);
}

public class MockDataService : IDataService
{
    private Dictionary<string, PlayerData> mockData = new Dictionary<string, PlayerData>();
    
    public async Task<PlayerData> LoadPlayerData(string playerId)
    {
        await Task.Delay(10); // Simulate network delay
        
        if (mockData.ContainsKey(playerId))
            return mockData[playerId];
            
        return new PlayerData { PlayerId = playerId, Level = 1, Experience = 0 };
    }
    
    public async Task SavePlayerData(PlayerData data)
    {
        await Task.Delay(10);
        mockData[data.PlayerId] = data;
    }
}

[Test]
public async Task PlayerProgression_SavesCorrectly()
{
    // Arrange
    var mockService = new MockDataService();
    var progression = new PlayerProgression(mockService);
    
    // Act
    await progression.AddExperience(100);
    var savedData = await mockService.LoadPlayerData("testPlayer");
    
    // Assert
    Assert.AreEqual(100, savedData.Experience);
}
```

---

## Estrutura de Projeto

### Organização de Pastas
```
Assets/
├── _Project/
│   ├── Scripts/
│   │   ├── Core/
│   │   │   ├── Managers/
│   │   │   ├── Systems/
│   │   │   └── Utilities/
│   │   ├── Gameplay/
│   │   │   ├── Player/
│   │   │   ├── Enemies/
│   │   │   ├── Items/
│   │   │   └── Environment/
│   │   ├── UI/
│   │   │   ├── Menus/
│   │   │   ├── HUD/
│   │   │   └── Components/
│   │   └── Data/
│   │       ├── ScriptableObjects/
│   │       └── Configurations/
│   ├── Art/
│   │   ├── Textures/
│   │   ├── Materials/
│   │   ├── Models/
│   │   └── Animations/
│   ├── Audio/
│   │   ├── Music/
│   │   ├── SFX/
│   │   └── Voice/
│   ├── Prefabs/
│   │   ├── Characters/
│   │   ├── Environment/
│   │   ├── UI/
│   │   └── Effects/
│   └── Scenes/
│       ├── Production/
│       ├── Development/
│       └── Testing/
├── Plugins/
├── StreamingAssets/
└── Third Party/
```

### Assembly Definitions
```csharp
// Core.asmdef
{
    "name": "Game.Core",
    "references": [],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false,
    "overrideReferences": false,
    "precompiledReferences": [],
    "autoReferenced": true,
    "defineConstraints": [],
    "versionDefines": []
}

// Gameplay.asmdef
{
    "name": "Game.Gameplay",
    "references": ["Game.Core"],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false
}

// UI.asmdef
{
    "name": "Game.UI",
    "references": ["Game.Core", "Game.Gameplay"],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false
}
```

---

## Asset Management

### Addressable Assets
```csharp
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

public class AddressableManager : MonoBehaviour
{
    private Dictionary<string, AsyncOperationHandle> loadedAssets = new Dictionary<string, AsyncOperationHandle>();
    
    public async Task<T> LoadAssetAsync<T>(string address) where T : Object
    {
        if (loadedAssets.ContainsKey(address))
        {
            return loadedAssets[address].Result as T;
        }
        
        var handle = Addressables.LoadAssetAsync<T>(address);
        await handle.Task;
        
        if (handle.Status == AsyncOperationStatus.Succeeded)
        {
            loadedAssets[address] = handle;
            return handle.Result;
        }
        
        Debug.LogError($"Failed to load asset: {address}");
        return null;
    }
    
    public void ReleaseAsset(string address)
    {
        if (loadedAssets.ContainsKey(address))
        {
            Addressables.Release(loadedAssets[address]);
            loadedAssets.Remove(address);
        }
    }
    
    public async Task PreloadAssets(string[] addresses)
    {
        var tasks = new List<Task>();
        
        foreach (string address in addresses)
        {
            tasks.Add(LoadAssetAsync<Object>(address));
        }
        
        await Task.WhenAll(tasks);
    }
}
```

### Asset Streaming
```csharp
public class StreamingAssetLoader : MonoBehaviour
{
    public async Task<string> LoadTextFromStreamingAssets(string fileName)
    {
        string filePath = Path.Combine(Application.streamingAssetsPath, fileName);
        
        if (Application.platform == RuntimePlatform.Android)
        {
            using (UnityWebRequest www = UnityWebRequest.Get(filePath))
            {
                await www.SendWebRequest();
                
                if (www.result == UnityWebRequest.Result.Success)
                {
                    return www.downloadHandler.text;
                }
                else
                {
                    Debug.LogError($"Failed to load {fileName}: {www.error}");
                    return null;
                }
            }
        }
        else
        {
            if (File.Exists(filePath))
            {
                return await File.ReadAllTextAsync(filePath);
            }
            else
            {
                Debug.LogError($"File not found: {filePath}");
                return null;
            }
        }
    }
}
```

---

## Debugging e Profiling

### Custom Debug Tools
```csharp
public static class DebugUtils
{
    [System.Diagnostics.Conditional("UNITY_EDITOR")]
    public static void DrawWireSphere(Vector3 center, float radius, Color color, float duration = 0f)
    {
        Debug.DrawWireSphere(center, radius, color, duration);
    }
    
    [System.Diagnostics.Conditional("UNITY_EDITOR")]
    public static void DrawArrow(Vector3 start, Vector3 direction, Color color, float duration = 0f)
    {
        Debug.DrawRay(start, direction, color, duration);
        
        Vector3 right = Vector3.Cross(direction, Vector3.up).normalized * 0.1f;
        Vector3 end = start + direction;
        
        Debug.DrawLine(end, end - direction.normalized * 0.2f + right, color, duration);
        Debug.DrawLine(end, end - direction.normalized * 0.2f - right, color, duration);
    }
    
    public static void LogWithContext(string message, Object context = null)
    {
        string timestamp = System.DateTime.Now.ToString("HH:mm:ss.fff");
        string contextInfo = context ? $"[{context.name}]" : "";
        Debug.Log($"[{timestamp}]{contextInfo} {message}", context);
    }
}

// Uso
public class PlayerController : MonoBehaviour
{
    void Update()
    {
        Vector3 moveDirection = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
        
        // Debug visual
        DebugUtils.DrawArrow(transform.position, moveDirection, Color.green);
        
        if (moveDirection.magnitude > 0.1f)
        {
            DebugUtils.LogWithContext($"Moving in direction: {moveDirection}", this);
        }
    }
}
```

### Performance Profiler
```csharp
public class PerformanceProfiler : MonoBehaviour
{
    private Dictionary<string, ProfileData> profiles = new Dictionary<string, ProfileData>();
    
    [System.Serializable]
    public class ProfileData
    {
        public float totalTime;
        public int callCount;
        public float averageTime => callCount > 0 ? totalTime / callCount : 0;
        public float lastTime;
    }
    
    public static PerformanceProfiler Instance { get; private set; }
    
    void Awake()
    {
        Instance = this;
    }
    
    public void StartProfile(string name)
    {
        if (!profiles.ContainsKey(name))
        {
            profiles[name] = new ProfileData();
        }
        
        profiles[name].lastTime = Time.realtimeSinceStartup;
    }
    
    public void EndProfile(string name)
    {
        if (profiles.ContainsKey(name))
        {
            float elapsed = Time.realtimeSinceStartup - profiles[name].lastTime;
            profiles[name].totalTime += elapsed;
            profiles[name].callCount++;
        }
    }
    
    public void LogProfiles()
    {
        foreach (var kvp in profiles)
        {
            var data = kvp.Value;
            Debug.Log($"{kvp.Key}: Avg={data.averageTime:F4}ms, Total={data.totalTime:F2}s, Calls={data.callCount}");
        }
    }
    
    void OnGUI()
    {
        if (Application.isEditor)
        {
            GUILayout.BeginArea(new Rect(10, 10, 300, 200));
            GUILayout.Label("Performance Profiles:");
            
            foreach (var kvp in profiles)
            {
                var data = kvp.Value;
                GUILayout.Label($"{kvp.Key}: {data.averageTime:F2}ms");
            }
            
            GUILayout.EndArea();
        }
    }
}

// Uso com using statement
public class ProfileScope : System.IDisposable
{
    private string profileName;
    
    public ProfileScope(string name)
    {
        profileName = name;
        PerformanceProfiler.Instance?.StartProfile(profileName);
    }
    
    public void Dispose()
    {
        PerformanceProfiler.Instance?.EndProfile(profileName);
    }
}

// Exemplo de uso
void ExpensiveOperation()
{
    using (new ProfileScope("ExpensiveOperation"))
    {
        // Código que queremos medir
        for (int i = 0; i < 1000; i++)
        {
            // Operação custosa
        }
    }
}
```

### Memory Profiler
```csharp
public class MemoryProfiler : MonoBehaviour
{
    [Header("Settings")]
    public bool enableProfiling = true;
    public float updateInterval = 1f;
    
    private float lastUpdateTime;
    private long lastTotalMemory;
    private List<MemorySnapshot> snapshots = new List<MemorySnapshot>();
    
    [System.Serializable]
    public class MemorySnapshot
    {
        public float timestamp;
        public long totalMemory;
        public long monoMemory;
        public long textureMemory;
        public long meshMemory;
        public long audioMemory;
    }
    
    void Update()
    {
        if (!enableProfiling) return;
        
        if (Time.time - lastUpdateTime >= updateInterval)
        {
            TakeSnapshot();
            lastUpdateTime = Time.time;
        }
    }
    
    void TakeSnapshot()
    {
        var snapshot = new MemorySnapshot
        {
            timestamp = Time.time,
            totalMemory = System.GC.GetTotalMemory(false),
            monoMemory = UnityEngine.Profiling.Profiler.GetMonoUsedSizeLong(),
            textureMemory = UnityEngine.Profiling.Profiler.GetAllocatedMemoryForGraphicsDriver(),
            meshMemory = UnityEngine.Profiling.Profiler.GetAllocatedMemoryForGraphicsDriver(),
            audioMemory = UnityEngine.Profiling.Profiler.GetAllocatedMemoryForGraphicsDriver()
        };
        
        snapshots.Add(snapshot);
        
        // Manter apenas os últimos 100 snapshots
        if (snapshots.Count > 100)
        {
            snapshots.RemoveAt(0);
        }
        
        // Detectar vazamentos de memória
        if (snapshot.totalMemory > lastTotalMemory * 1.5f)
        {
            Debug.LogWarning($"Possible memory leak detected! Memory increased from {lastTotalMemory / 1024 / 1024}MB to {snapshot.totalMemory / 1024 / 1024}MB");
        }
        
        lastTotalMemory = snapshot.totalMemory;
    }
    
    public void ExportSnapshots()
    {
        string json = JsonUtility.ToJson(new SerializableList<MemorySnapshot>(snapshots), true);
        string path = Path.Combine(Application.persistentDataPath, "memory_profile.json");
        File.WriteAllText(path, json);
        Debug.Log($"Memory profile exported to: {path}");
    }
}
```

---

## Conclusão

Este guia abrange as principais áreas de melhores práticas para desenvolvimento em Unity:

1. **Performance**: Otimizações de CPU/GPU, gerenciamento de memória
2. **Arquitetura**: Padrões de design robustos e escaláveis
3. **Networking**: Implementação confiável de multiplayer
4. **UI/UX**: Interfaces responsivas e acessíveis
5. **Testes**: Cobertura completa com unit, integration e performance tests
6. **Organização**: Estrutura de projeto limpa e maintível
7. **Assets**: Gerenciamento eficiente de recursos
8. **Debug**: Ferramentas para identificar e resolver problemas

Lembre-se de adaptar essas práticas às necessidades específicas do seu projeto e sempre medir o impacto das otimizações antes de implementá-las em produção.
