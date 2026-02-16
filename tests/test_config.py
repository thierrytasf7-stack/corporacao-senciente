import pytest
import os
import tempfile
from pathlib import Path
from az_os.core.config_manager import ConfigManager, ConfigSchema


class TestConfigManager:
    def setup_method(self):
        """Setup test configuration"""
        self.temp_dir = tempfile.TemporaryDirectory()
        self.config_path = os.path.join(self.temp_dir.name, "config.yaml")
        os.environ["AZ_MODEL"] = "test-model"
        os.environ["AZ_TIMEOUT"] = "60"
        
    def teardown_method(self):
        """Teardown test configuration"""
        self.temp_dir.cleanup()
        del os.environ["AZ_MODEL"]
        del os.environ["AZ_TIMEOUT"]
    
    def test_default_config(self):
        """Test default configuration values"""
        manager = ConfigManager()
        config = manager.get_config()
        
        assert config.model == "claude"
        assert config.timeout == 30
        assert config.max_retries == 3
        assert config.log_level == "INFO"
        assert config.base_url == "https://api.lite.llm"
    
    def test_env_override(self):
        """Test environment variable overrides"""
        manager = ConfigManager()
        config = manager.get_config()
        
        assert config.model == "test-model"
        assert config.timeout == 60
    
    def test_file_override(self):
        """Test file configuration override"""
        # Create config file
        file_config = {
            "model": "file-model",
            "timeout": 45,
            "max_retries": 5,
            "log_level": "DEBUG"
        }
        
        with open(self.config_path, 'w') as f:
            yaml.safe_dump(file_config, f)
        
        manager = ConfigManager()
        config = manager.get_config()
        
        assert config.model == "file-model"
        assert config.timeout == 45
        assert config.max_retries == 5
        assert config.log_level == "DEBUG"
    
    def test_env_overrides_file(self):
        """Test environment variables override file config"""
        # Create config file
        file_config = {
            "model": "file-model",
            "timeout": 45,
            "max_retries": 5,
            "log_level": "DEBUG"
        }
        
        with open(self.config_path, 'w') as f:
            yaml.safe_dump(file_config, f)
        
        manager = ConfigManager()
        config = manager.get_config()
        
        assert config.model == "test-model"  # From env
        assert config.timeout == 60  # From env
        assert config.max_retries == 5  # From file
        assert config.log_level == "DEBUG"  # From file
    
    def test_set_get_config(self):
        """Test setting and getting config values"""
        manager = ConfigManager()
        
        manager.set("model", "test-model-2")
        manager.set("timeout", 120)
        
        assert manager.get("model") == "test-model-2"
        assert manager.get("timeout") == 120
        assert manager.get("max_retries") == 3  # Default
    
    def test_invalid_key(self):
        """Test setting invalid config key"""
        manager = ConfigManager()
        
        with pytest.raises(KeyError):
            manager.set("invalid_key", "value")
    
    def test_config_validation(self):
        """Test config validation"""
        manager = ConfigManager()
        
        # Valid config
        assert manager.validate_config() == True
        
        # Invalid log level
        manager.set("log_level", "INVALID")
        assert manager.validate_config() == False
        
        # Reset to valid
        manager.set("log_level", "INFO")
        assert manager.validate_config() == True
    
    def test_save_config(self):
        """Test saving config to file"""
        manager = ConfigManager()
        
        manager.set("model", "save-test")
        manager.set("timeout", 99)
        
        # Save config
        asyncio.run(manager.save_config())
        
        # Load and verify
        with open(self.config_path, 'r') as f:
            saved_config = yaml.safe_load(f)
        
        assert saved_config["model"] == "save-test"
        assert saved_config["timeout"] == 99
        assert saved_config["max_retries"] == 3  # Default, not saved
    
    def test_config_schema(self):
        """Test Pydantic config schema"""
        # Test valid config
        valid_config = ConfigSchema(
            model="claude",
            timeout=30,
            max_retries=3,
            log_level="INFO"
        )
        assert valid_config.model == "claude"
        
        # Test invalid log level
        with pytest.raises(ValueError):
            ConfigSchema(log_level="INVALID")
    
    def test_missing_file(self):
        """Test behavior when config file doesn't exist"""
        manager = ConfigManager()
        config = manager.get_config()
        
        # Should use defaults and env overrides
        assert config.model == "test-model"
        assert config.timeout == 60
    
    def test_empty_file(self):
        """Test behavior with empty config file"""
        # Create empty config file
        with open(self.config_path, 'w') as f:
            f.write("")
        
        manager = ConfigManager()
        config = manager.get_config()
        
        # Should use defaults and env overrides
        assert config.model == "test-model"
        assert config.timeout == 60
    
    def test_partial_file(self):
        """Test behavior with partial config file"""
        # Create partial config file
        partial_config = {
            "model": "partial-model"
        }
        
        with open(self.config_path, 'w') as f:
            yaml.safe_dump(partial_config, f)
        
        manager = ConfigManager()
        config = manager.get_config()
        
        # Should merge partial file with defaults and env
        assert config.model == "partial-model"
        assert config.timeout == 60  # From env
        assert config.max_retries == 3  # Default
    
    def test_reload_config(self):
        """Test config reload functionality"""
        manager = ConfigManager()
        
        # Initial config
        initial_config = manager.get_config()
        assert initial_config.model == "test-model"
        
        # Change env and reload
        os.environ["AZ_MODEL"] = "reload-test"
        manager.reload()
        
        reloaded_config = manager.get_config()
        assert reloaded_config.model == "reload-test"
        
        # Clean up
        del os.environ["AZ_MODEL"]