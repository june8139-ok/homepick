import type {
    EvaluationInput,
    InfraLevel,
    JobLevel,
    NatureLevel,
    RoadLevel,
    SchoolLevel,
    TransportLevel,
  } from "./types";
  
  function clamp(score: number, max: number) {
    return Math.min(Math.max(score, 0), max);
  }
  
  export function calculateLocationScore(evaluation: EvaluationInput) {
    const schoolMap: Record<SchoolLevel, number> = {
      "elementary-middle-high-1to3min": 5,
      "elementary-middle-high-walk": 4,
      "elementary-walk-middle-high-near": 3,
      "elementary-walk": 2,
      weak: 1,
      unknown: 1,
    };
  
    const transportMap: Record<TransportLevel, number> = {
      "station-ic-future": 5,
      "station-or-rail-good-road": 4,
      "ic-good": 3,
      "car-only": 2,
      weak: 1,
      unknown: 1,
    };
  
    const infraMap: Record<InfraLevel, number> = {
      excellent: 4,
      good: 3,
      normal: 2,
      weak: 1,
      unknown: 1,
    };
  
    const jobMap: Record<JobLevel, number> = {
      excellent: 3,
      good: 2,
      weak: 1,
      unknown: 1,
    };
  
    const natureMap: Record<NatureLevel, number> = {
      good: 2,
      normal: 1,
      weak: 0,
      unknown: 1,
    };
  
    const roadMap: Record<RoadLevel, number> = {
      good: 1,
      weak: 0,
      unknown: 0,
    };
  
    return clamp(
      schoolMap[evaluation.schoolLevel] +
        transportMap[evaluation.transportLevel] +
        infraMap[evaluation.infraLevel] +
        jobMap[evaluation.jobLevel] +
        natureMap[evaluation.natureLevel] +
        roadMap[evaluation.roadLevel],
      20
    );
  }