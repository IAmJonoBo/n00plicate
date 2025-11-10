#!/usr/bin/env python3
"""Repo-local helper for n00plicate."""

from __future__ import annotations

import argparse
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent


def list_packages() -> None:
    pkgs_dir = REPO_ROOT / "packages"
    if not pkgs_dir.exists():
        print("No packages directory found.")
        return
    for pkg in sorted(pkgs_dir.iterdir()):
        if pkg.is_dir():
            print(f"- {pkg.name}")


def main() -> int:
    parser = argparse.ArgumentParser(description="n00plicate helper CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("packages", help="List available packages.")
    subparsers.add_parser("status", help="Show git status for n00plicate.")

    args = parser.parse_args()
    if args.command == "packages":
        list_packages()
    elif args.command == "status":
        import subprocess

        subprocess.run(["git", "status", "-sb"], check=True, cwd=REPO_ROOT)
    else:  # pragma: no cover
        parser.print_help()
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
