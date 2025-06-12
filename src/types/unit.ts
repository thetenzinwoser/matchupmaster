export interface UnitData {
    good_against: string[];
    countered_by: string[];
}

export interface UnitsData {
    [key: string]: UnitData;
} 