"use client";

type NaverGeocodeAddress = {
  x: string;
  y: string;
};

type NaverGeocodeResponse = {
  v2?: {
    addresses?: NaverGeocodeAddress[];
  };
};

type NaverMapsService = {
  Status: {
    OK: unknown;
  };
  geocode: (
    options: { query: string },
    callback: (
      status: unknown,
      response: NaverGeocodeResponse
    ) => void
  ) => void;
};

type NaverMaps = {
  Service?: NaverMapsService;
};

type NaverGlobal = {
  maps?: NaverMaps;
};

declare global {
  interface Window {
    naver?: NaverGlobal;
    __homepickNaverGeocodePromise?: Promise<void>;
  }
}

export type Coordinates = {
  latitude: number;
  longitude: number;
};

function getNaverService(): NaverMapsService | null {
  return window.naver?.maps?.Service ?? null;
}

function loadNaverGeocoder(clientId: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("브라우저에서만 위치를 찾을 수 있습니다.")
    );
  }

  if (getNaverService()) {
    return Promise.resolve();
  }

  if (window.__homepickNaverGeocodePromise) {
    return window.__homepickNaverGeocodePromise;
  }

  window.__homepickNaverGeocodePromise = new Promise<void>(
    (resolve, reject) => {
      const existing =
        document.querySelector<HTMLScriptElement>(
          'script[data-homepick-naver-geocoder="true"]'
        );

      if (existing) {
        if (getNaverService()) {
          resolve();
          return;
        }

        existing.addEventListener(
          "load",
          () => {
            if (getNaverService()) {
              resolve();
            } else {
              reject(
                new Error(
                  "네이버 Geocoder 모듈을 불러오지 못했습니다."
                )
              );
            }
          },
          { once: true }
        );

        existing.addEventListener(
          "error",
          () =>
            reject(
              new Error(
                "네이버 지도 스크립트를 불러오지 못했습니다."
              )
            ),
          { once: true }
        );

        return;
      }

      const script = document.createElement("script");
      script.dataset.homepickNaverGeocoder = "true";
      script.async = true;
      script.src =
        "https://oapi.map.naver.com/openapi/v3/maps.js" +
        `?ncpKeyId=${encodeURIComponent(clientId)}` +
        "&submodules=geocoder";

      script.onload = () => {
        if (getNaverService()) {
          resolve();
        } else {
          reject(
            new Error(
              "네이버 Geocoder 모듈을 불러오지 못했습니다."
            )
          );
        }
      };

      script.onerror = () =>
        reject(
          new Error(
            "네이버 지도 스크립트를 불러오지 못했습니다."
          )
        );

      document.head.appendChild(script);
    }
  );

  return window.__homepickNaverGeocodePromise;
}

export async function geocodeAddress(
  address: string
): Promise<Coordinates> {
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    throw new Error("사업지 주소를 입력해주세요.");
  }

  const clientId =
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "";

  if (!clientId) {
    throw new Error(
      ".env.local에 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 등록해주세요."
    );
  }

  await loadNaverGeocoder(clientId);

  return new Promise<Coordinates>((resolve, reject) => {
    const service = getNaverService();

    if (!service) {
      reject(
        new Error(
          "네이버 Geocoder 모듈이 준비되지 않았습니다."
        )
      );
      return;
    }

    service.geocode(
      { query: trimmedAddress },
      (
        status: unknown,
        response: NaverGeocodeResponse
      ) => {
        const addresses = response.v2?.addresses;

        if (
          status !== service.Status.OK ||
          !addresses?.length
        ) {
          reject(
            new Error(
              "주소의 위치를 찾지 못했습니다. 시·도부터 번지까지 정확히 입력해주세요."
            )
          );
          return;
        }

        const first = addresses[0];
        const latitude = Number(first.y);
        const longitude = Number(first.x);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          reject(
            new Error("좌표 변환 결과가 올바르지 않습니다.")
          );
          return;
        }

        resolve({ latitude, longitude });
      }
    );
  });
}