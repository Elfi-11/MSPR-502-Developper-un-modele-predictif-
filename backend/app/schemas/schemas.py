from pydantic import BaseModel, ConfigDict, Field, validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

# ----------- Enums et Constantes -----------#
class IndicateurType(str, Enum):
    NEW_CASES = "new_cases"
    NEW_DEATHS = "new_deaths"
    COUNTRIES_REPORTING = "countries_reporting"

# ----------- d_location -----------#
class DLocationBase(BaseModel):
    location_name: str

class DLocationCreate(DLocationBase):
    pass

class DLocationRead(DLocationBase):
    location_id: int
    model_config = ConfigDict(from_attributes=True)

# ----------- f_covid -----------#
class FCovidBase(BaseModel):
    date: date
    location_id: int
    total_cases: Optional[float] = None
    new_cases: Optional[float] = None
    total_deaths: Optional[float] = None
    new_deaths: Optional[float] = None
    icu_patients: Optional[float] = None
    hosp_patients: Optional[float] = None
    total_vaccinations: Optional[float] = None
    people_vaccinated: Optional[float] = None

class FCovidCreate(FCovidBase):
    pass

class FCovidRead(FCovidBase):
    covid_fact_id: int
    model_config = ConfigDict(from_attributes=True)

# ----------- f_mpox -----------#
class FMpoxBase(BaseModel):
    date: date
    location_id: int
    total_cases: Optional[float] = None
    total_deaths: Optional[float] = None
    new_cases: Optional[float] = None
    new_deaths: Optional[float] = None
    new_cases_smoothed: Optional[float] = None
    new_deaths_smoothed: Optional[float] = None
    new_cases_per_million: Optional[float] = None
    total_cases_per_million: Optional[float] = None
    new_cases_smoothed_per_million: Optional[float] = None
    new_deaths_per_million: Optional[float] = None
    total_deaths_per_million: Optional[float] = None
    new_deaths_smoothed_per_million: Optional[float] = None

class FMpoxCreate(FMpoxBase):
    pass

class FMpoxRead(FMpoxBase):
    mpox_fact_id: int
    model_config = ConfigDict(from_attributes=True)

# ----------- f_predi_covid -----------#
class FPrediCovidBase(BaseModel):
    date_predite: date
    date_generation: Optional[datetime] = None
    location_id: int
    indicateur: IndicateurType
    valeur_predite: float = Field(..., ge=0, description="Valeur prédite (doit être positive)")
    model_name: str

    @validator('date_predite')
    def validate_date_predite(cls, v):
        if v < date(2020, 1, 1):
            raise ValueError("La date de prédiction doit être postérieure à 2020")
        return v

class FPrediCovidCreate(FPrediCovidBase):
    pass

class FPrediCovidRead(FPrediCovidBase):
    pred_id: int
    model_config = ConfigDict(from_attributes=True)

# ----------- Request Models -----------#
class PredictionFilters(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(100, gt=0, le=1000)
    location_id: Optional[int] = None
    indicateur: Optional[IndicateurType] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    pays: Optional[str] = None

    @validator('date_fin')
    def validate_dates(cls, v, values):
        if v and 'date_debut' in values and values['date_debut']:
            if v < values['date_debut']:
                raise ValueError("La date de fin doit être postérieure à la date de début")
        return v

    @validator('limit')
    def validate_limit(cls, v):
        if v > 1000:
            raise ValueError("La limite maximale est de 1000 enregistrements")
        return v