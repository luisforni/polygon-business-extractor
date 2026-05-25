from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    google_places_api_key: str = ""
    foursquare_api_key: str = ""
    yelp_api_key: str = ""
    enabled_providers: str = "overpass,google,foursquare,yelp"
    cors_origins: str = "http://localhost:3000"

    @property
    def active_providers(self) -> list[str]:
        return [p.strip() for p in self.enabled_providers.split(",") if p.strip()]

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
