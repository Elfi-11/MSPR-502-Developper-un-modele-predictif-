from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

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

    class Config:
        orm_mode = True

# ----------- f_predi_covid -----------#
class FPrediCovidBase(BaseModel):
    date_predite: date
    date_generation: Optional[datetime] = None
    location_id: int
    indicateur: str
    horizon: int
    valeur_predite: float
    model_name: str
    # scenario: Optional[str] = None
    # score_confiance: Optional[float] = None

class FPrediCovidCreate(FPrediCovidBase):
    pass

class FPrediCovidRead(FPrediCovidBase):
    pred_id: int
    model_config = ConfigDict(from_attributes=True)