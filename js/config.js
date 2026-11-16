// Supabase(클라우드 저장소) 연결에 필요한 프로젝트 주소와 브라우저 공개 키(Publishable key / anon key)를 설정하는 파일입니다.
// 주의: 관리자용 비밀 키(Secret key)는 절대 이곳에 넣지 마세요! 오직 공개용 키(Publishable key)만 넣어야 안전합니다.
const SUPABASE_CONFIG = {
  // 예: 'https://abcdefghijklmnop.supabase.co'
  url: 'YOUR_SUPABASE_PROJECT_URL',

  // 예: 'sb_publishable_...' 또는 'eyJhbGciOi...' (Publishable / anon 공개 키만 입력)
  publishableKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY',

  // 사진이 저장될 Supabase Storage 버킷(사진 보관함) 이름
  bucketName: 'photos'
};

// Supabase 설정값이 실제로 입력되었는지 확인해 주는 함수입니다.
function isSupabaseConfigured() {
  if (!SUPABASE_CONFIG || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.publishableKey) {
    return false;
  }
  if (
    SUPABASE_CONFIG.url === 'YOUR_SUPABASE_PROJECT_URL' ||
    SUPABASE_CONFIG.publishableKey === 'YOUR_SUPABASE_PUBLISHABLE_KEY'
  ) {
    return false;
  }
  return true;
}

