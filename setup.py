import setuptools
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("src/az_os/__init__.py", "r", encoding="utf-8") as fh:
    for line in fh:
        if line.startswith("__version__"):
            version = line.strip().split('=')[1].strip(' '\"\n')
            break

setup(
    name="az-os",
    version=version,
    author="Diana Corporacao Senciente",
    author_email="dev@diana.ai",
    description="Advanced Zero-OS - Enterprise Operating System",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/diana-corporacao/az-os",
    project_urls={
        "Bug Reports": "https://github.com/diana-corporacao/az-os/issues",
        "Source": "https://github.com/diana-corporacao/az-os",
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: Microsoft :: Windows",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: System :: Operating System",
        "Topic :: System :: Monitoring",
        "Topic :: Security",
    ],
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    python_requires=">=3.8",
    install_requires=[
        "cryptography>=3.4.8",
        "sqlite3",
        "pytest>=7.0.0",
        "pytest-asyncio>=0.21.0",
        "bandit>=1.7.0",
        "mypy>=0.950",
    ],
    extras_require={
        "dev": [
            "pytest-cov>=3.0.0",
            "black>=22.0.0",
            "flake8>=4.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "az-os=src.az_os.cli:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.md", "*.txt", "*.cfg"],
    },
    zip_safe=False,
)