"""Setup script for AZ-OS v2.0."""

import os
from setuptools import setup, find_packages

# Read long description from README
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Read requirements
def read_requirements(filename):
    """Read requirements from file."""
    with open(filename, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]

# Version
VERSION = "2.0.0"

setup(
    name="az-os",
    version=VERSION,
    author="Diana Corporação Senciente",
    author_email="dev@diana-corporacao-senciente.com",
    description="Agent Zero Operating System - Cognitive OS for autonomous task execution",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/diana-corporacao-senciente/az-os",
    project_urls={
        "Bug Tracker": "https://github.com/diana-corporacao-senciente/az-os/issues",
        "Documentation": "https://az-os.readthedocs.io",
        "Source Code": "https://github.com/diana-corporacao-senciente/az-os",
    },
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Typing :: Typed",
    ],
    python_requires=">=3.8",
    install_requires=[
        "typer[all]>=0.9.0",
        "rich>=13.0.0",
        "textual>=0.47.0",
        "pydantic>=2.0.0",
        "pyyaml>=6.0",
        "aiosqlite>=0.19.0",
        "httpx>=0.25.0",
        "litellm>=1.23.0",
        "psutil>=5.9.0",
        "cryptography>=41.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.1.0",
            "pytest-mock>=3.11.0",
            "black>=23.0.0",
            "mypy>=1.5.0",
            "bandit>=1.7.5",
            "safety>=2.3.0",
            "flake8>=6.1.0",
            "isort>=5.12.0",
        ],
        "rag": [
            "chromadb>=0.4.0",
            "sentence-transformers>=2.2.0",
        ],
        "all": [
            "chromadb>=0.4.0",
            "sentence-transformers>=2.2.0",
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.1.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "az-os=az_os.cli.main:app",
        ],
    },
    include_package_data=True,
    zip_safe=False,
    keywords=[
        "ai",
        "llm",
        "agent",
        "automation",
        "cognitive",
        "operating-system",
        "task-execution",
        "openrouter",
        "claude",
        "gpt",
    ],
    license="MIT",
)
