import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from app import MISSION_PROFILE, app


REQUIRED_ROUTES = ["/", "/simulator", "/metrics", "/architecture", "/healthz"]
REQUIRED_SOURCES = {
    "NASA",
    "ESA",
    "ROSCOSMOS",
    "CelesTrak",
    "Space-Track",
}
REQUIRED_FORMATS = {"JSON", "TLE", "glTF", "OBJ"}


def assert_routes() -> None:
    client = app.test_client()
    for route in REQUIRED_ROUTES:
        response = client.get(route)
        assert response.status_code == 200, f"{route} returned {response.status_code}"

    profile = client.get("/api/mission-profile")
    assert profile.status_code == 200, "/api/mission-profile is not available"
    assert profile.is_json, "/api/mission-profile must return JSON"


def assert_open_data_sources() -> None:
    source_text = " ".join(
        source["name"] for source in MISSION_PROFILE["openDataSources"]
    )
    missing = {source for source in REQUIRED_SOURCES if source not in source_text}
    assert not missing, f"Missing open-data sources: {', '.join(sorted(missing))}"


def assert_data_formats() -> None:
    format_text = " ".join(
        item["format"] for item in MISSION_PROFILE["dataStandards"]
    )
    missing = {fmt for fmt in REQUIRED_FORMATS if fmt not in format_text}
    assert not missing, f"Missing data formats: {', '.join(sorted(missing))}"


def main() -> None:
    assert_routes()
    assert_open_data_sources()
    assert_data_formats()
    print("Project validation passed.")


if __name__ == "__main__":
    main()
