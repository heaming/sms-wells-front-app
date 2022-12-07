// hotfix
// 서버 빌드 시 메모리 초과 원인이 됩니다.
const lcAllocateAc112tb = [];

/*
  광역시도, 시군구
  ASIS의 데이터가 ToBe로 이관되면 사용하지 않을 예정
*/
export async function getDistricts(type, fr2pLgldCd) {
  let ret;
  if (type === undefined && fr2pLgldCd === undefined) {
    ret = lcAllocateAc112tb.map((x) => ({
      fr2pLgldCd: x.fr2pLgldCd ? x.fr2pLgldCd.source : '',
      tryNm: x.tryNm ? x.tryNm.source : '',
      sggNm: x.sggNm ? x.sggNm.source : '',
      lawcEmdNm: x.lawcEmdNm ? x.lawcEmdNm.source : '',
      amtdNm: x.amtdNm ? x.amtdNm.source : '',
      ac112MgtHemdNm: x.ac112MgtHemdNm ? x.ac112MgtHemdNm.source : '',
    }));
  }
  if (type === 'sido') {
    ret = [
      { fr2pLgldCd: '11', tryNm: '서울특별시' },
      { fr2pLgldCd: '26', tryNm: '부산광역시' },
      { fr2pLgldCd: '27', tryNm: '대구광역시' },
      { fr2pLgldCd: '28', tryNm: '인천광역시' },
      { fr2pLgldCd: '29', tryNm: '광주광역시' },
      { fr2pLgldCd: '30', tryNm: '대전광역시' },
      { fr2pLgldCd: '31', tryNm: '울산광역시' },
      { fr2pLgldCd: '36', tryNm: '세종특별자치시' },
      { fr2pLgldCd: '41', tryNm: '경기도' },
      { fr2pLgldCd: '42', tryNm: '강원도' },
      { fr2pLgldCd: '43', tryNm: '충청북도' },
      { fr2pLgldCd: '44', tryNm: '충청남도' },
      { fr2pLgldCd: '45', tryNm: '전라북도' },
      { fr2pLgldCd: '46', tryNm: '전라남도' },
      { fr2pLgldCd: '47', tryNm: '경상북도' },
      { fr2pLgldCd: '48', tryNm: '경상남도' },
      { fr2pLgldCd: '50', tryNm: '제주특별자치도' },
    ];
  }
  if (type === 'gu') {
    ret = [
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '강남구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '강동구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '강북구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '강서구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '관악구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '광진구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '구로구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '금천구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '노원구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '도봉구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '동대문구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '동작구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '마포구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '서대문구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '서초구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '성동구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '성북구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '송파구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '양천구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '영등포구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '용산구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '은평구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '종로구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '중구' },
      { fr2pLgldCd: '11', tryNm: '서울특별시', sggNm: '중랑구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '강서구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '금정구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '기장군' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '남구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '동구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '동래구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '부산진구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '북구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '사상구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '사하구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '서구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '수영구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '연제구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '영도구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '중구' },
      { fr2pLgldCd: '26', tryNm: '부산광역시', sggNm: '해운대구' },
      { fr2pLgldCd: '27', tryNm: '대구광역시', sggNm: '남구' },
      { fr2pLgldCd: '27', tryNm: '대구광역시', sggNm: '달서구' },
      { fr2pLgldCd: '27', tryNm: '대구광역시', sggNm: '달성군' },
      { fr2pLgldCd: '27', tryNm: '대구광역시', sggNm: '동구' },
      { fr2pLgldCd: '27', tryNm: '대구광역시', sggNm: '북구' },
      { fr2pLgldCd: '27', tryNm: '대구광역시', sggNm: '서구' },
      { fr2pLgldCd: '27', tryNm: '대구광역시', sggNm: '수성구' },
      { fr2pLgldCd: '27', tryNm: '대구광역시', sggNm: '중구' },
      { fr2pLgldCd: '28', tryNm: '인천광역시', sggNm: '강화군' },
      { fr2pLgldCd: '28', tryNm: '인천광역시', sggNm: '계양구' },
      { fr2pLgldCd: '28', tryNm: '인천광역시', sggNm: '남동구' },
      { fr2pLgldCd: '28', tryNm: '인천광역시', sggNm: '동구' },
      { fr2pLgldCd: '28', tryNm: '인천광역시', sggNm: '미추홀구' },
      { fr2pLgldCd: '28', tryNm: '인천광역시', sggNm: '부평구' },
      { fr2pLgldCd: '28', tryNm: '인천광역시', sggNm: '서구' },
      { fr2pLgldCd: '28', tryNm: '인천광역시', sggNm: '연수구' },
      { fr2pLgldCd: '28', tryNm: '인천광역시', sggNm: '옹진군' },
      { fr2pLgldCd: '28', tryNm: '인천광역시', sggNm: '중구' },
      { fr2pLgldCd: '29', tryNm: '광주광역시', sggNm: '광산구' },
      { fr2pLgldCd: '29', tryNm: '광주광역시', sggNm: '남구' },
      { fr2pLgldCd: '29', tryNm: '광주광역시', sggNm: '동구' },
      { fr2pLgldCd: '29', tryNm: '광주광역시', sggNm: '북구' },
      { fr2pLgldCd: '29', tryNm: '광주광역시', sggNm: '서구' },
      { fr2pLgldCd: '30', tryNm: '대전광역시', sggNm: '대덕구' },
      { fr2pLgldCd: '30', tryNm: '대전광역시', sggNm: '동구' },
      { fr2pLgldCd: '30', tryNm: '대전광역시', sggNm: '서구' },
      { fr2pLgldCd: '30', tryNm: '대전광역시', sggNm: '유성구' },
      { fr2pLgldCd: '30', tryNm: '대전광역시', sggNm: '중구' },
      { fr2pLgldCd: '31', tryNm: '울산광역시', sggNm: '남구' },
      { fr2pLgldCd: '31', tryNm: '울산광역시', sggNm: '동구' },
      { fr2pLgldCd: '31', tryNm: '울산광역시', sggNm: '북구' },
      { fr2pLgldCd: '31', tryNm: '울산광역시', sggNm: '울주군' },
      { fr2pLgldCd: '31', tryNm: '울산광역시', sggNm: '중구' },
      { fr2pLgldCd: '36', tryNm: '세종특별자치시', sggNm: ' ' },
      { fr2pLgldCd: '36', tryNm: '세종특별자치시', sggNm: '' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '가평군' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '고양시 덕양구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '고양시 일산동구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '고양시 일산서구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '과천시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '광명시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '광주시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '구리시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '군포시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '김포시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '남양주시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '동두천시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '부천시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '성남시 분당구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '성남시 수정구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '성남시 중원구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '수원시 권선구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '수원시 영통구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '수원시 장안구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '수원시 팔달구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '시흥시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '안산시 단원구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '안산시 상록구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '안성시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '안양시 동안구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '안양시 만안구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '양주시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '양평군' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '여주시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '연천군' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '오산시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '용인시 기흥구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '용인시 수지구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '용인시 처인구' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '의왕시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '의정부시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '이천시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '파주시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '평택시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '포천시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '하남시' },
      { fr2pLgldCd: '41', tryNm: '경기도', sggNm: '화성시' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '강릉시' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '고성군' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '동해시' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '삼척시' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '속초시' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '양구군' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '양양군' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '영월군' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '원주시' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '인제군' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '정선군' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '철원군' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '춘천시' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '태백시' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '평창군' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '홍천군' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '화천군' },
      { fr2pLgldCd: '42', tryNm: '강원도', sggNm: '횡성군' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '괴산군' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '단양군' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '보은군' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '영동군' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '옥천군' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '음성군' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '제천시' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '증평군' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '진천군' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '청주시 상당구' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '청주시 서원구' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '청주시 청원구' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '청주시 흥덕구' },
      { fr2pLgldCd: '43', tryNm: '충청북도', sggNm: '충주시' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '계룡시' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '공주시' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '금산군' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '논산시' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '당진시' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '보령시' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '부여군' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '서산시' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '서천군' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '아산시' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '예산군' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '천안시 동남구' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '천안시 서북구' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '청양군' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '태안군' },
      { fr2pLgldCd: '44', tryNm: '충청남도', sggNm: '홍성군' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '고창군' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '군산시' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '김제시' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '남원시' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '무주군' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '부안군' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '순창군' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '완주군' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '익산시' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '임실군' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '장수군' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '전주시 덕진구' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '전주시 완산구' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '정읍시' },
      { fr2pLgldCd: '45', tryNm: '전라북도', sggNm: '진안군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '강진군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '고흥군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '곡성군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '광양시' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '구례군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '나주시' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '담양군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '목포시' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '무안군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '보성군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '순천시' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '신안군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '여수시' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '영광군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '영암군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '완도군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '장성군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '장흥군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '진도군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '함평군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '해남군' },
      { fr2pLgldCd: '46', tryNm: '전라남도', sggNm: '화순군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '경산시' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '경주시' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '고령군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '구미시' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '군위군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '김천시' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '문경시' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '봉화군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '상주시' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '성주군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '안동시' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '영덕군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '영양군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '영주시' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '영천시' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '예천군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '울릉군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '울진군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '의성군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '청도군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '청송군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '칠곡군' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '포항시 남구' },
      { fr2pLgldCd: '47', tryNm: '경상북도', sggNm: '포항시 북구' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '거제시' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '거창군' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '고성군' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '김해시' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '남해군' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '밀양시' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '사천시' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '산청군' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '양산시' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '의령군' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '진주시' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '창녕군' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '창원시 마산합포구' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '창원시 마산회원구' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '창원시 성산구' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '창원시 의창구' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '창원시 진해구' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '통영시' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '하동군' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '함안군' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '함양군' },
      { fr2pLgldCd: '48', tryNm: '경상남도', sggNm: '합천군' },
      { fr2pLgldCd: '50', tryNm: '제주특별자치도', sggNm: '서귀포시' },
      { fr2pLgldCd: '50', tryNm: '제주특별자치도', sggNm: '제주시' },
    ];
    ret = fr2pLgldCd ? ret.filter((obj) => obj.fr2pLgldCd === fr2pLgldCd) : ret;
  }
  return ret;
}
