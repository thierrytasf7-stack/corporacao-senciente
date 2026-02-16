from typing import List
import openai


class Vectorizer:
    def __init__(self):
        self.api_key = self._get_api_key()
        
    def _get_api_key(self) -> str:
        """Get OpenAI API key from environment"""
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
        return api_key

    def encode(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for texts"""
        try:
            client = openai.OpenAI(api_key=self.api_key)
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=texts
            )
            
            return [embedding.embedding for embedding in response.data]
            
        except Exception as e:
            raise RuntimeError(f"Failed to generate embeddings: {e}")