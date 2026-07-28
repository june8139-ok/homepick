import type {
    Apartment,
  } from "../types/apartment";
  
  /*
   * 광역자치단체 이름만 들어온 경우
   * 지역 상세페이지 단위로 사용하지 않습니다.
   */
  const provinceNames = new Set([
    "서울",
    "서울특별시",
    "부산",
    "부산광역시",
    "대구",
    "대구광역시",
    "인천",
    "인천광역시",
    "광주",
    "광주광역시",
    "대전",
    "대전광역시",
    "울산",
    "울산광역시",
    "세종",
    "세종특별자치시",
    "경기",
    "경기도",
    "강원",
    "강원도",
    "강원특별자치도",
    "충북",
    "충청북도",
    "충남",
    "충청남도",
    "전북",
    "전라북도",
    "전북특별자치도",
    "전남",
    "전라남도",
    "경북",
    "경상북도",
    "경남",
    "경상남도",
    "제주",
    "제주도",
    "제주특별자치도",
  ]);
  
  const metropolitanNames = new Map([
    ["서울특별시", "서울"],
    ["서울", "서울"],
  
    ["부산광역시", "부산"],
    ["부산", "부산"],
  
    ["대구광역시", "대구"],
    ["대구", "대구"],
  
    ["인천광역시", "인천"],
    ["인천", "인천"],
  
    ["광주광역시", "광주"],
    ["광주", "광주"],
  
    ["대전광역시", "대전"],
    ["대전", "대전"],
  
    ["울산광역시", "울산"],
    ["울산", "울산"],
  
    ["세종특별자치시", "세종"],
    ["세종시", "세종"],
    ["세종", "세종"],
  ]);
  
  function cleanRegionText(
    value: unknown
  ) {
    return String(value ?? "")
      .replace(/[(),]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  function removeAdministrativeSuffix(
    value: string
  ) {
    return value
      .replace(
        /(특별자치시|특별시|광역시|특별자치도|시|군)$/u,
        ""
      )
      .trim();
  }
  
  /*
   * "경기도 김포시 풍무동"
   * "충청북도 음성군 대소면"
   * "충청북도 청주시 흥덕구"
   *
   * 위 주소에서 김포시, 음성군, 청주시를 추출합니다.
   */
  function extractCityOrCountyFromAddress(
    value: unknown
  ) {
    const text =
      cleanRegionText(value);
  
    if (!text) {
      return "";
    }
  
    for (
      const [
        metropolitan,
        normalized,
      ] of metropolitanNames
    ) {
      if (
        text.startsWith(
          metropolitan
        )
      ) {
        return normalized;
      }
    }
  
    const matches =
      text.match(
        /[가-힣]+(?:특별자치시|시|군)/g
      ) ?? [];
  
    const cityOrCounty =
      matches.find(
        (item) =>
          !provinceNames.has(item)
      );
  
    return cityOrCounty
      ? removeAdministrativeSuffix(
          cityOrCounty
        )
      : "";
  }
  
  function normalizeCandidate(
    value: unknown
  ) {
    const text =
      cleanRegionText(value);
  
    if (!text) {
      return "";
    }
  
    const metropolitan =
      metropolitanNames.get(text);
  
    if (metropolitan) {
      return metropolitan;
    }
  
    if (
      provinceNames.has(text)
    ) {
      return "";
    }
  
    /*
     * 흥덕구, 달서구처럼 구 단위만 들어온 값은
     * 지역 대표값으로 사용하지 않습니다.
     */
    if (
      /구$/u.test(text) &&
      !/(시|군)\s/u.test(text)
    ) {
      return "";
    }
  
    return removeAdministrativeSuffix(
      text
    );
  }
  
  /*
   * 지역 대표 키 결정 순서
   *
   * 1. 전체 주소에서 시·군 추출
   * 2. districtName
   * 3. district
   * 4. cityName
   * 5. city
   *
   * 김포시 → 김포
   * 음성군 → 음성
   * 청주시 → 청주
   * 대전광역시 → 대전
   */
  export function getApartmentRegionKey(
    apartment: Apartment
  ) {
    const addressRegion =
      extractCityOrCountyFromAddress(
        apartment.region
      );
  
    if (addressRegion) {
      return addressRegion;
    }
  
    const candidates = [
      apartment.districtName,
      apartment.district,
      apartment.cityName,
      apartment.city,
    ];
  
    for (
      const candidate of candidates
    ) {
      const normalized =
        normalizeCandidate(
          candidate
        );
  
      if (normalized) {
        return normalized;
      }
    }
  
    return "";
  }
  
  export function getApartmentRegionName(
    apartment: Apartment
  ) {
    return getApartmentRegionKey(
      apartment
    );
  }
  
  export function normalizeRegionRoute(
    value: string
  ) {
    return removeAdministrativeSuffix(
      decodeURIComponent(value)
        .replace(/\+/g, " ")
        .trim()
    );
  }
  
  export function isApartmentInRegion(
    apartment: Apartment,
    region: string
  ) {
    return (
      getApartmentRegionKey(
        apartment
      ) ===
      normalizeRegionRoute(region)
    );
  }