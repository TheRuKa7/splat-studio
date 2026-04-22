"""Training CLI."""
from __future__ import annotations

from pathlib import Path

import typer
from rich.console import Console

from splat_studio import __version__

app = typer.Typer(no_args_is_help=True)
console = Console()


@app.command()
def version() -> None:
    console.print(f"splat-studio [bold cyan]v{__version__}[/]")


@app.command()
def preflight(video: Path = typer.Option(..., "--video", help="input video")) -> None:
    """Check whether a scene is likely to train successfully. Full impl in P1."""
    console.print(f"[yellow]stub[/] preflight {video}")


@app.command()
def train(
    video: Path = typer.Option(..., "--video"),
    output: Path = typer.Option(..., "--output", help="output .ksplat"),
    iters: int = typer.Option(30_000, "--iters"),
) -> None:
    """Run end-to-end pipeline: ffmpeg → COLMAP → gsplat → .ksplat. Full impl in P1."""
    console.print(f"[yellow]stub[/] train video={video} out={output} iters={iters}")


if __name__ == "__main__":
    app()
