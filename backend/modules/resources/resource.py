from typing import Callable, NamedTuple, Optional


class Resource(NamedTuple):
    """Interface for resources."""

    type: str
    #func: Callable[[str], str]
    description: Optional[str] = None
