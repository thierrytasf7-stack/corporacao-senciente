from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

class Branding:
    @staticmethod
    def add_watermark(image_path: str, output_path: str, text: str = "ARETE") -> None:
        """
        Adiciona marca d'água à imagem.

        Args:
            image_path (str): Caminho para a imagem original
            output_path (str): Caminho para salvar a imagem com marca d'água
            text (str): Texto da marca d'água (padrão: "ARETE")
        """
        # Carrega a imagem
        image = Image.open(image_path).convert("RGBA")
        width, height = image.size

        # Cria uma imagem para a marca d'água
        watermark = Image.new("RGBA", (width, height))
        draw = ImageDraw.Draw(watermark)

        # Carrega a fonte (tenta diferentes tamanhos)
        try:
            font_size = min(width // 20, 72)
            font = ImageFont.truetype("arial.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()

        # Calcula posição centralizada
        text_width, text_height = draw.textsize(text, font=font)
        position = ((width - text_width) // 2, (height - text_height) // 2)

        # Desenha a marca d'água com transparência
        alpha = 0.08
        watermark_layer = Image.new("RGBA", image.size)
        watermark_draw = ImageDraw.Draw(watermark_layer)
        watermark_draw.text(position, text, font=font, fill=(255, 255, 255, int(255 * alpha)))

        # Aplica a marca d'água à imagem
        watermarked_image = Image.alpha_composite(image, watermark_layer)

        # Salva a imagem resultante
        watermarked_image.save(output_path, "PNG")

    @staticmethod
    def get_seal_svg() -> str:
        """
        Retorna o SVG do selo ARETE.

        Returns:
            str: String contendo o SVG do selo
        """
        return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4a90e2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#357abd;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f5a623;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f49713;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#grad1)" stroke-width="8"/>
  <path d="M30 100 Q70 40 100 100 T170 100" fill="none" stroke="url(#grad2)" stroke-width="6" stroke-linecap="round"/>
  <path d="M100 100 Q70 160 30 100" fill="none" stroke="url(#grad2)" stroke-width="6" stroke-linecap="round"/>
  <path d="M100 100 Q130 160 170 100" fill="none" stroke="url(#grad2)" stroke-width="6" stroke-linecap="round"/>
  <text x="100" y="65" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="url(#grad1)">ARETE</text>
  <text x="100" y="85" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="url(#grad2)">SEAL</text>
</svg>'''
