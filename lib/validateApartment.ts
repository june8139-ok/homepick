type ApartmentData = {
    name?: string;
    cityName?: string;
    region?: string;
    price?: string;
    condition?: string;
  };
  
  export function validateApartment(apartment: ApartmentData) {
    const errors: string[] = [];
  
    if (!apartment.name) errors.push("단지명을 입력하세요.");
    if (!apartment.cityName) errors.push("지역을 입력하세요.");
    if (!apartment.region) errors.push("주소를 입력하세요.");
    if (!apartment.price) errors.push("분양가를 입력하세요.");
    if (!apartment.condition) errors.push("계약조건을 선택하세요.");
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  }