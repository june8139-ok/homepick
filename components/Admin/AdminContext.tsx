"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

import type { EvaluationInput } from "../../data/scoring";

type Score = {
  total: number;
  price: number;
  contract: number;
  location: number;
  living: number;
  future: number;
  risk: number;
};

export type BasicInfo = {
  name: string;
  brand: string;
  builder: string;

  cityName: string;
  region: string;

  latitude: number | null;
  longitude: number | null;

  totalHouseholds: string;
  saleHouseholds: string;

  moveInDate: string;
  salePrice: string;
  pricePerPyeong: string;

  parking: string;
  scale: string;
  usage: string;
  developer: string;
};

export type LocationInfo = {
  transport: string;
  education: string;
  living: string;
  jobAccess: string;
  nature: string;
  futureValue: string;
  cautions: string;
};

type ApartmentImages = {
  hero: string[];
  location: string[];

  floorPlans: {
    name: string;
    url: string;
  }[];

  community: string[];
  gallery: string[];
};

type InitialApartment = {
  slug?: string;
  name?: string;
  brand?: string;
  builder?: string;

  cityName?: string;
  region?: string;

  latitude?: number | null;
  longitude?: number | null;

  price?: string;

  priceDetail?: {
    pricePerPyeong?: string;
  };

  projectInfo?: {
    totalHouseholds?: string;
    saleHouseholds?: string;
    parking?: string;
    scale?: string;
    usage?: string;
    moveInDate?: string;
    developer?: string;
  };

  locationInfo?: Partial<LocationInfo>;

  score?: Score;

  images?: {
    hero?: string | string[];
    location?: string | string[];

    floorPlans?: {
      name: string;
      url: string;
    }[];

    community?: string | string[];
    gallery?: string | string[];
  };
};

type AdminContextType = {
  editingSlug?: string;

  basicInfo: BasicInfo;
  setBasicInfo: (basicInfo: BasicInfo) => void;

  locationInfo: LocationInfo;
  setLocationInfo: (
    locationInfo: LocationInfo
  ) => void;

  images: ApartmentImages;
  setImages: (
    images: ApartmentImages
  ) => void;

  evaluation: EvaluationInput;
  updateEvaluation: (
    evaluation: EvaluationInput
  ) => void;
  setEvaluation: (
    evaluation: EvaluationInput
  ) => void;

  savedScore?: Score;

  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
};

const defaultBasicInfo: BasicInfo = {
  name: "",
  brand: "",
  builder: "",

  cityName: "",
  region: "",

  latitude: null,
  longitude: null,

  totalHouseholds: "",
  saleHouseholds: "",

  moveInDate: "",
  salePrice: "",
  pricePerPyeong: "",

  parking: "",
  scale: "",
  usage: "아파트",
  developer: "",
};

const defaultLocationInfo: LocationInfo = {
  transport: "",
  education: "",
  living: "",
  jobAccess: "",
  nature: "",
  futureValue: "",
  cautions: "",
};

const defaultImages: ApartmentImages = {
  hero: [],
  location: [],
  floorPlans: [],
  community: [],
  gallery: [],
};

const defaultEvaluation: EvaluationInput = {
  priceLevel: "normal",

  contractType: "ratio-10",
  middlePaymentType: "interest-deferred",
  optionBenefitType: "paid",
  cashBenefitType: "none",
  balanceSupport: "no",

  schoolLevel: "unknown",
  transportLevel: "unknown",
  infraLevel: "unknown",
  jobLevel: "unknown",
  natureLevel: "unknown",
  roadLevel: "unknown",

  brandGrade: 2,
  communityGrade: 2,
  parkingGrade: 2,
  floorPlanGrade: 2,
  scaleGrade: 2,

  futureTransportGrade: 1,
  futureJobGrade: 1,
  developmentGrade: 1,
  scarcityGrade: 1,

  riskLevel: "normal",
};

const AdminContext =
  createContext<AdminContextType | null>(null);

function toArray(
  value?: string | string[]
) {
  if (!value) return [];

  return Array.isArray(value)
    ? value
    : [value];
}

function createInitialBasicInfo(
  apartment?: InitialApartment
): BasicInfo {
  if (!apartment) {
    return defaultBasicInfo;
  }

  return {
    name: apartment.name ?? "",
    brand: apartment.brand ?? "",
    builder: apartment.builder ?? "",

    cityName: apartment.cityName ?? "",
    region: apartment.region ?? "",

    latitude: apartment.latitude ?? null,
    longitude: apartment.longitude ?? null,

    totalHouseholds:
      apartment.projectInfo
        ?.totalHouseholds ?? "",

    saleHouseholds:
      apartment.projectInfo
        ?.saleHouseholds ?? "",

    moveInDate:
      apartment.projectInfo
        ?.moveInDate ?? "",

    salePrice:
      apartment.price ?? "",

    pricePerPyeong:
      apartment.priceDetail
        ?.pricePerPyeong ?? "",

    parking:
      apartment.projectInfo
        ?.parking ?? "",

    scale:
      apartment.projectInfo
        ?.scale ?? "",

    usage:
      apartment.projectInfo
        ?.usage ?? "아파트",

    developer:
      apartment.projectInfo
        ?.developer ?? "",
  };
}

function createInitialLocationInfo(
  apartment?: InitialApartment
): LocationInfo {
  if (!apartment?.locationInfo) {
    return defaultLocationInfo;
  }

  return {
    transport:
      apartment.locationInfo.transport ??
      "",

    education:
      apartment.locationInfo.education ??
      "",

    living:
      apartment.locationInfo.living ??
      "",

    jobAccess:
      apartment.locationInfo.jobAccess ??
      "",

    nature:
      apartment.locationInfo.nature ??
      "",

    futureValue:
      apartment.locationInfo.futureValue ??
      "",

    cautions:
      apartment.locationInfo.cautions ??
      "",
  };
}

function createInitialImages(
  apartment?: InitialApartment
): ApartmentImages {
  if (!apartment?.images) {
    return defaultImages;
  }

  return {
    hero:
      toArray(apartment.images.hero),

    location:
      toArray(apartment.images.location),

    floorPlans:
      apartment.images.floorPlans ?? [],

    community:
      toArray(
        apartment.images.community
      ),

    gallery:
      toArray(apartment.images.gallery),
  };
}

export function AdminProvider({
  children,
  initialApartment,
}: {
  children: React.ReactNode;
  initialApartment?: InitialApartment;
}) {
  const [basicInfo, setBasicInfoState] =
    useState<BasicInfo>(
      createInitialBasicInfo(
        initialApartment
      )
    );

  const [
    locationInfo,
    setLocationInfoState,
  ] = useState<LocationInfo>(
    createInitialLocationInfo(
      initialApartment
    )
  );

  const [images, setImagesState] =
    useState<ApartmentImages>(
      createInitialImages(
        initialApartment
      )
    );

  const [
    evaluation,
    setEvaluationState,
  ] = useState<EvaluationInput>(
    defaultEvaluation
  );

  const [isDirty, setIsDirty] =
    useState(false);

  const setBasicInfo = (
    nextBasicInfo: BasicInfo
  ) => {
    setBasicInfoState(nextBasicInfo);
    setIsDirty(true);
  };

  const setLocationInfo = (
    nextLocationInfo: LocationInfo
  ) => {
    setLocationInfoState(
      nextLocationInfo
    );

    setIsDirty(true);
  };

  const setImages = (
    nextImages: ApartmentImages
  ) => {
    setImagesState(nextImages);
    setIsDirty(true);
  };

  const updateEvaluation = (
    nextEvaluation: EvaluationInput
  ) => {
    setEvaluationState(
      nextEvaluation
    );

    setIsDirty(true);
  };

  return (
    <AdminContext.Provider
      value={{
        editingSlug:
          initialApartment?.slug,

        basicInfo,
        setBasicInfo,

        locationInfo,
        setLocationInfo,

        images,
        setImages,

        evaluation,
        updateEvaluation,
        setEvaluation:
          updateEvaluation,

        savedScore:
          initialApartment?.score,

        isDirty,
        setIsDirty,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context =
    useContext(AdminContext);

  if (!context) {
    throw new Error(
      "useAdmin은 AdminProvider 안에서만 사용할 수 있습니다."
    );
  }

  return context;
}