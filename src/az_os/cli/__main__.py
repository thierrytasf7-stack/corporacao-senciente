import click
from .auto_recover import auto_recover
from .scheduler import scheduler


@click.group()
def az():
    """AZ-OS Command Line Interface"""
    pass


az.add_command(auto_recover, name="task auto-recover")
az.add_command(scheduler, name="scheduler")


if __name__ == '__main__':
    az()
