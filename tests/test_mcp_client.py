import asyncio
import unittest
from unittest.mock import Mock, patch
from datetime import datetime

from az_os.core.mcp_client import (
    MCPClient,
    MCPRequest,
    MCPResponse,
    MCPFilesystem,
    MCPShellExecutor,
    MCPWebFetcher
)


class TestMCPClient(unittest.IsolatedAsyncioTestCase):
    async def test_mcp_request_response(self):
        """Test MCP request/response serialization"""
        request = MCPRequest(id="123", method="test.method", params={"key": "value"})
        
        self.assertEqual(request.id, "123")
        self.assertEqual(request.method, "test.method")
        self.assertEqual(request.params, {"key": "value"})
        
        # Test JSON serialization
        json_data = request.json()
        self.assertIn("id", json_data)
        self.assertIn("method", json_data)
        self.assertIn("params", json_data)
        
    async def test_mcp_client_basic_operations(self):
        """Test basic MCP client operations"""
        # Mock the HTTP client
        mock_client = Mock()
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "id": "123",
            "result": "success",
            "error": None
        }
        mock_client.post.return_value = mock_response
        
        client = MCPClient()
        client.client = mock_client  # Inject mock client
        
        # Test filesystem operations
        result = await client.read_file("test.txt")
        self.assertEqual(result, "success")
        
        result = await client.write_file("test.txt", "content")
        self.assertEqual(result, "success")
        
        result = await client.list_directory("/")
        self.assertEqual(result, "success")
        
        result = await client.create_directory("new_dir")
        self.assertEqual(result, "success")
        
        result = await client.delete_file("test.txt")
        self.assertEqual(result, "success")
        
        # Test shell execution
        result = await client.shell_exec("echo hello")
        self.assertEqual(result, "success")
        
        # Test web fetch
        result = await client.web_fetch("https://example.com")
        self.assertEqual(result, "success")
        
    async def test_mcp_client_error_handling(self):
        """Test MCP client error handling"""
        # Mock the HTTP client
        mock_client = Mock()
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.json.return_value = {
            "id": "123",
            "result": None,
            "error": {"message": "Invalid request"}
        }
        mock_client.post.return_value = mock_response
        
        client = MCPClient()
        client.client = mock_client  # Inject mock client
        
        with self.assertRaises(Exception) as context:
            await client.read_file("test.txt")
        
        self.assertIn("Invalid request", str(context.exception))
        
    async def test_mcp_client_retry_logic(self):
        """Test MCP client retry logic"""
        # Mock the HTTP client to fail twice then succeed
        mock_client = Mock()
        
        def side_effect(*args, **kwargs):
            if not hasattr(side_effect, "count"):
                side_effect.count = 0
            side_effect.count += 1
            
            if side_effect.count <= 2:
                raise Exception("Temporary failure")
            
            response = Mock()
            response.status_code = 200
            response.json.return_value = {
                "id": "123",
                "result": "success",
                "error": None
            }
            return response
        
        mock_client.post.side_effect = side_effect
        
        client = MCPClient(max_retries=3)
        client.client = mock_client  # Inject mock client
        
        result = await client.read_file("test.txt")
        self.assertEqual(result, "success")
        
        # Verify retry happened
        self.assertEqual(mock_client.post.call_count, 3)
        
    async def test_mcp_filesystem_operations(self):
        """Test MCPFilesystem wrapper"""
        mock_client = Mock()
        mock_client.read_file.return_value = "file content"
        mock_client.write_file.return_value = True
        mock_client.list_directory.return_value = [{"name": "file.txt", "type": "file"}]
        mock_client.create_directory.return_value = True
        mock_client.delete_file.return_value = True
        
        filesystem = MCPFilesystem(mock_client)
        
        # Test read
        content = await filesystem.read("test.txt")
        self.assertEqual(content, "file content")
        
        # Test write
        result = await filesystem.write("test.txt", "new content")
        self.assertTrue(result)
        
        # Test list
        files = await filesystem.list("/")
        self.assertEqual(len(files), 1)
        self.assertEqual(files[0]["name"], "file.txt")
        
        # Test create directory
        result = await filesystem.create_directory("new_dir")
        self.assertTrue(result)
        
        # Test delete
        result = await filesystem.delete("test.txt")
        self.assertTrue(result)
        
    async def test_mcp_shell_executor(self):
        """Test MCPShellExecutor wrapper"""
        mock_client = Mock()
        mock_client.shell_exec.return_value = {"stdout": "hello", "stderr": "", "exit_code": 0}
        
        executor = MCPShellExecutor(mock_client)
        
        result = await executor.execute("echo hello")
        self.assertEqual(result["stdout"], "hello")
        self.assertEqual(result["stderr"], "")
        self.assertEqual(result["exit_code"], 0)
        
    async def test_mcp_web_fetcher(self):
        """Test MCPWebFetcher wrapper"""
        mock_client = Mock()
        mock_client.web_fetch.return_value = {"content": "<html>example</html>", "status": 200}
        
        fetcher = MCPWebFetcher(mock_client)
        
        result = await fetcher.fetch("https://example.com")
        self.assertEqual(result["content"], "<html>example</html>")
        self.assertEqual(result["status"], 200)
        
    async def test_mcp_client_context_manager(self):
        """Test MCPClient context manager"""
        client = MCPClient()
        
        async with client:
            self.assertTrue(client.client.is_connected())
        
        # After context, client should be closed
        self.assertFalse(client.client.is_connected())


if __name__ == '__main__':
    unittest.main()