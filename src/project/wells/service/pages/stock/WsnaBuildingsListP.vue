<!----
 ****************************************************************************************************
 * 프로그램 개요
 ****************************************************************************************************
 1. 모듈 : SNA (재고관리)
 2. 프로그램 ID : Z-CU-U-0000P00(임시) WsnaBuildingListP - 빌딩정보 조회
 3. 작성자 : songTaeSung
 4. 작성일 : 2023.06.23
 ****************************************************************************************************
 * 프로그램 설명
 ****************************************************************************************************
 - 빌딩정보 조회 (http://localhost:3000/#/service/Z-CU-U-0000P00)
 ****************************************************************************************************
--->

<template>
  <kw-popup
    size="xl"
  >
    <kw-search
      cols="2"
      one-row
      @search="onClickSearch"
    >
      <kw-search-row>
        <wwsn-manager-og-search-item-group
          v-model:dgr1-levl-og-id="searchParams.dgr1LevlOgId"
          v-model:dgr2-levl-og-id="searchParams.dgr2LevlOgId"
          dgr1-levl-og-first-option="all"
          dgr2-levl-og-first-option="all"
          dgr1-levl-og-label="ogCdNm"
          dgr2-levl-og-label="ogCdNm"
          use-og-level="2"
          :use-partner="false"
        />
      </kw-search-row>
    </kw-search>
    <div class="mt30">
      <kw-action-top>
        <template #left>
          <kw-paging-info
            v-model:page-index="pageInfo.pageIndex"
            v-model:page-size="pageInfo.pageSize"
            :total-count="pageInfo.totalCount"
            :page-size-options="codes.COD_PAGE_SIZE_OPTIONS"
            @change="getBuildingInformPages"
          />
        </template>
      </kw-action-top>
      <kw-grid
        ref="grdMainRef"
        :page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @init="initGrdMain"
      />
      <kw-pagination
        v-model:page-index="pageInfo.pageIndex"
        v-model:page-size="pageInfo.pageSize"
        :total-count="pageInfo.totalCount"
        @change="getBuildingInformPages"
      />
    </div>
    <template
      v-if="isCheckbox"
      #action
    >
      <kw-btn
        :label="$t('MSG_BTN_CANCEL')"
        @click="onClickCancel"
      />
      <kw-btn
        :label="$t('MSG_BTN_SELT')"
        primary
        @click="onClickSelect"
      />
    </template>
  </kw-popup>
</template>
<script setup>
// -------------------------------------------------------------------------------------------------
// Import & Declaration
// -------------------------------------------------------------------------------------------------
import { useMeta, useDataService, getComponentType, defineGrid, codeUtil, useModal, gridUtil, useGlobal } from 'kw-lib';
import WwsnManagerOgSearchItemGroup from '~sms-wells/service/components/WwsnManagerOgSearchItemGroup.vue';
import { onMounted } from 'vue';
import { isEmpty, cloneDeep } from 'lodash-es';

const { t } = useI18n();
const { getConfig } = useMeta();
const { cancel: onClickCancel, ok } = useModal();
const { alert } = useGlobal();
const dataService = useDataService();
const props = defineProps({
  dgr1LevlOgId: {
    type: String,
    default: '',
  },
  dgr2LevlOgId: {
    type: String,
    default: '',
  },
});

// -------------------------------------------------------------------------------------------------
// Function & Event
// -------------------------------------------------------------------------------------------------
const grdMainRef = ref(getComponentType('KwGrid'));

const codes = await codeUtil.getMultiCodes(
  'COD_PAGE_SIZE_OPTIONS',
);

const searchParams = ref({
  dgr1LevlOgId: isEmpty(props.dgr1LevlOgId) ? '' : props.dgr1LevlOgId,
  dgr2LevlOgId: isEmpty(props.dgr2LevlOgId) ? '' : props.dgr2LevlOgId,
});

let cachedParams;
const isCheckbox = props.checkType === 'checkbox';

const pageInfo = ref({
  totalCount: 0,
  pageIndex: 1,
  pageSize: Number(getConfig('CFG_CMZ_DEFAULT_PAGE_SIZE')),
});

async function fetchBuildingInformPages(params) {
  return await dataService.get('/sms/wells/service/warehouse-organizations/buildings/paging', params);
}

async function getBuildingInformPages() {
  const res = await fetchBuildingInformPages({ params: { ...cachedParams, ...pageInfo.value } });
  const { list: BuildingResources, pageInfo: pagingResult } = res.data;

  pageInfo.value = pagingResult;

  const view = grdMainRef.value.getView();

  view.getDataSource().setRows(BuildingResources);
  view.rowIndicator.indexOffset = gridUtil.getPageIndexOffset(pageInfo);
}

async function onClickSearch() {
  pageInfo.value.pageIndex = 1;
  cachedParams = cloneDeep(searchParams.value);
  await getBuildingInformPages();
}

async function onClickSelect() {
  const view = grdMainRef.value.getView();
  const checked = gridUtil.getCheckedRowValues(view);
  if (checked.length === 0) {
    await alert(t('MSG_ALT_NOT_SEL_ITEM'));
  } else {
    ok(checked);
  }
}

// -------------------------------------------------------------------------------------------------
// Initialize Grid
// -------------------------------------------------------------------------------------------------
const initGrdMain = defineGrid((data, view) => {
  const fields = [
    { fieldName: 'bldCd' }, // 빌딩코드
    { fieldName: 'bldCdNm' }, // 빌딩코드명
    { fieldName: 'bldNm' }, // 빌딩명
    { fieldName: 'bldAdr' }, // 빌딩주소
    { fieldName: 'rnadr' }, // 도로명주소
    { fieldName: 'rdadr' }, // 도로명주소상세
    { fieldName: 'newAdrZip' }, // 신주소우편번호
    { fieldName: 'adrId' }, // 주소ID

  ];

  const columns = [
    { fieldName: 'bldCd', header: t('MSG_TXT_BLD_CD'), width: '150', styleName: 'text-center' },
    { fieldName: 'bldNm', header: t('MSG_TXT_BLD_NM'), width: '150', styleName: 'text-left' },
    { fieldName: 'bldAdr', header: t('MSG_TXT_ADDR'), width: '380', styleName: 'text-left' },
  ];

  data.setFields(fields);
  view.setColumns(columns);

  view.rowIndicator.visible = true;
  view.checkBar.visible = isCheckbox;

  if (isCheckbox) {
    // 셀 클릭 시
    view.onCellClicked = (grid, clickData) => {
      if (clickData.cellType === 'data') {
        grid.checkItem(clickData.itemIndex, !grid.isCheckedItem(clickData.itemIndex));
      }
    };
  } else {
    // 셀 더블클릭 시
    view.onCellDblClicked = (grid, clickData) => {
      if (clickData.cellType === 'data') {
        ok([{ ...grid.getValues(clickData.itemIndex) }]);
      }
    };
  }
});
onMounted(async () => {
  await onClickSearch();
});

</script>
