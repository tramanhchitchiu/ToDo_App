from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class ApiResponse(BaseModel):
    success: bool
    data: Any
    error: Optional[str] = None
    timestamp: str


def ok(data: Any) -> ApiResponse:
    return ApiResponse(
        success=True,
        data=data,
        error=None,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


def err(message: str) -> ApiResponse:
    return ApiResponse(
        success=False,
        data=None,
        error=message,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )
