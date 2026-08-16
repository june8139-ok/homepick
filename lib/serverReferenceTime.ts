import {
  unstable_cache,
} from "next/cache";

/**
 * 홈은 ISR(revalidate=60)로 빠르게 제공하고,
 * "최근 업데이트" 계산에 필요한 기준 시각만 60초 단위로 캐시합니다.
 *
 * connection()을 사용하지 않으므로 홈 전체가 요청 시점
 * 동적 렌더링으로 전환되지 않습니다.
 */
const getCachedReferenceNow =
  unstable_cache(
    async () => Date.now(),
    ["home-reference-now"],
    {
      revalidate: 60,
    }
  );

export async function getServerReferenceNow() {
  return getCachedReferenceNow();
}
