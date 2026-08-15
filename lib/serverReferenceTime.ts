import {
    connection,
  } from "next/server";
  
  /**
   * 요청 시점의 기준 시각을 React 렌더 함수 바깥에서 생성합니다.
   *
   * connection() 이후에 현재 시각을 읽어 Next.js가 이 값을
   * 정적 프리렌더 값으로 취급하지 않도록 합니다.
   */
  export async function getServerReferenceNow() {
    await connection();
  
    return Date.now();
  }
  