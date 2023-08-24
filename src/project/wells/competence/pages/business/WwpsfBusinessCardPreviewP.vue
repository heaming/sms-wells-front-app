<!----
****************************************************************************************************
* 프로그램 개요
****************************************************************************************************
1. 모듈 : CTB
2. 프로그램 ID : WwpsfBusinessCardPreviewP - 명함첩관리 - 발신명함보기
3. 작성자 : jisung you
4. 작성일 : 2023.08.10
****************************************************************************************************
* 프로그램 설명
****************************************************************************************************
-명함첩관리-발신명함보기
****************************************************************************************************
--->
<template>
  <kw-page title="발송명함 조회">
    <div class="border-box ma15 pa20">
      <div class="row justify-between no-wrap">
        <div class="column w80">
          <kw-avatar
            font-size="15px"
            color="line-bg"
            size="80px"
            squre
          >
            KYOWON
            <!--<img
              src="node_modules/kw-lib/src/assets/images/example_profile.png"
              alt="profile"
            >-->
          </kw-avatar>
          <kw-avatar
            size="80px"
            class="mt30"
          >
            <img
              :src="searchParams.realFpath"
              :alt="searchParams.fnm"
            >
          </kw-avatar>
        </div>
        <ul class="column card-text ml20">
          <li>
            <h3>{{ searchParams.fnm }}</h3>
          </li>
          <li>
            <span>
              {{ searchParams.blgNm }} / {{ searchParams.rsbNm }}
            </span>
          </li>
          <li>
            <h3 class="mt15">
              교원 KYOWON
            </h3>
          </li>
          <li>
            <span>
              Mobile.{{ searchParams.cralLocaraTno }} - {{ searchParams.mexnoEncr }}- {{ searchParams.cralIdvTno }}
            </span>
          </li>
          <li>
            <span>
              Tel.{{ searchParams.locaraTno }} - {{ searchParams.exnoEncr }}- {{ searchParams.idvTno }}
            </span>
          </li>
          <li>
            <span>
              Fax.{{ searchParams.faxLocaraTno }} - {{ searchParams.faxExno }}- {{ searchParams.faxIdvTno }}
            </span>
          </li>
          <li>
            <span>
              {{ searchParams.emadr }}
            </span>
          </li>
          <li>
            <span>
              {{ searchParams.basAdr }} {{ searchParams.dtlAdr }}
            </span>
          </li>
        </ul>
        <div class="column">
          <kw-avatar
            font-size="15px"
            color="line-bg"
            size="80px"
            squre
          >
            Wells
            <!--<img
              src="node_modules/kw-lib/src/assets/images/example_profile.png"
              alt="profile"
            >-->
          </kw-avatar>
        </div>
      </div>
    </div>
  </kw-page>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useDataService } from 'kw-lib';
import { cloneDeep } from 'lodash-es';

const dataService = useDataService();
// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const props = defineProps({
  ogTpCd: { type: String, default: () => '' },
  prtnrNo: { type: String, default: () => '' },
});

let cachedParams;

const searchParams = ref({
  fnm: '',
  blgNm: '',
  rsbNm: '',
  ctplcImgFileId: '', /* 연락처이미지파일ID */
  cralLocaraTno: '', /* 휴대지역전화번호 */
  mexnoEncr: '', /* 휴대전화국번호암호화 */
  cralIdvTno: '', /* 휴대개별전화번호 */
  locaraTno: '', /* 지역전화번호 */
  exnoEncr: '', /* 전화국번호암호화 */
  idvTno: '', /* 개별전화번호 */
  zip: '', /* 우편번호 */
  basAdr: '', /* 기본주소 */
  dtlAdr: '', /* 상세주소 */
  adrId: '',
  faxLocaraTno: '',
  faxExno: '',
  faxIdvTno: '',
  emadr: '',
  ctplcApnImgFileId: '',
  realFpath: '',
  fileNm: '',

});

const params = ref({
  ogTpCd: props.ogTpCd,
  prtnrNo: props.prtnrNo,
});

const onClickSearch = async () => {
  const res = await dataService.get('/sms/wells/competence/business/partner/contact-base', { params: { ...cachedParams } });
  Object.assign(searchParams.value, res.data);
};

onMounted(async () => {
  cachedParams = cloneDeep(params.value);
  await onClickSearch();
});

</script>
<style scoped></style>
