import { getNumberWithComma } from '~sms-common/contract/util';
import { warn } from 'vue';

function getFnlAmt(fnlVal, appliedPromotions = [], sellDscCtrAmt = 0) {
  const minRentalFxam = appliedPromotions
    .reduce(
      (minVal, promotion) => {
        if (!promotion.rentalFxam || Number.isNaN(Number(promotion.rentalFxam))) {
          return minVal;
        }
        return Math.min(minVal, Number(promotion.rentalFxam));
      },
      fnlVal,
    );
  if (minRentalFxam - sellDscCtrAmt < 0) {
    warn('법인 특별 할인가가 프로모션 적용 금액보다 큽니다.');
  }

  return Math.max(minRentalFxam - sellDscCtrAmt, 0);
}

export function getSpayAmt(pdBas, finalPrice, appliedPromotions = [], sellDscCtrAmt = 0) {
  if (!finalPrice || !pdBas) { return; }
  const { rglrSppPrmMcn } = pdBas;
  const { fnlVal, cntrAmt, svVstPrdCd, pcsvPrdCd, sellTpCd, cntrAmtDscYn } = finalPrice;
  const fnlAmt = getFnlAmt(fnlVal, appliedPromotions, sellDscCtrAmt);

  if (sellTpCd === '1') {
    return fnlAmt;
  }
  if (sellTpCd === '2') {
    return cntrAmtDscYn === 'Y' ? 0 : cntrAmt;
  }
  if (sellTpCd === '3') {
    return 0;
  }
  if (sellTpCd === '6') {
    if (!rglrSppPrmMcn) { // 선납개월이 없는 경우
      return 0;
    }
    if (rglrSppPrmMcn > 0) {
      let spayAmt = fnlAmt * rglrSppPrmMcn;
      const svPrd = Math.max(Number(svVstPrdCd) || 0, Number(pcsvPrdCd) || 0);
      if (svPrd) {
        spayAmt /= svPrd;
      }
      return spayAmt;
    }
  }
}

export function getSpayAmtByCntrDtl(cntrDtl) {
  if (!cntrDtl) { return undefined; }
  const { fnlAmt, cntrAmt, sellTpCd } = cntrDtl;
  if (sellTpCd === '1') {
    return Number(fnlAmt) || 0;
  }
  if (sellTpCd === '2') {
    return Number(cntrAmt) || 0;
  }
  if (sellTpCd === '3') {
    return 0;
  }
  if (sellTpCd === '6') {
    return Number(cntrAmt) || 0;
  }
}

export function getAftnAmt(finalPrice, appliedPromotions = [], sellDscCtrAmt = 0) {
  if (!finalPrice) { return; }
  const { fnlVal, svVstPrdCd, pcsvPrdCd, sellTpCd } = finalPrice;
  const fnlAmt = getFnlAmt(fnlVal, appliedPromotions, sellDscCtrAmt);
  if (sellTpCd === '1') {
    return 0;
  }
  if (sellTpCd === '2') {
    return fnlAmt;
  }
  if (sellTpCd === '3') {
    return fnlAmt;
  }
  if (sellTpCd === '6') {
    let aftnAmt = fnlAmt;
    const svPrd = Math.max(Number(svVstPrdCd) || 0, Number(pcsvPrdCd) || 0);
    if (svPrd) {
      aftnAmt /= svPrd;
    }
    return aftnAmt;
  }
}

export function getAftnAmtByCntrDtl(cntrDtl) {
  if (!cntrDtl) { return undefined; }
  const { fnlAmt, svPrd, sellTpCd } = cntrDtl;
  if (sellTpCd === '1') {
    return 0;
  }
  if (sellTpCd === '2') {
    return fnlAmt;
  }
  if (sellTpCd === '3') {
    return fnlAmt;
  }
  if (sellTpCd === '6') {
    return fnlAmt / svPrd;
  }
}

export function getDisplayedPrice(finalPrice, sellDscCtrAmt = 0) {
  if (!finalPrice) {
    return '미확정';
  }
  const { fnlVal, svVstPrdCd, pcsvPrdCd, stplPrdCd, sellTpCd } = finalPrice;
  if (fnlVal !== 0 && !fnlVal) {
    return '미확정';
  }
  const fnlAmt = getFnlAmt(fnlVal, [], sellDscCtrAmt);
  if (sellTpCd === '1') {
    return `${getNumberWithComma(fnlAmt)}원`;
  }
  if (sellTpCd === '2') {
    return `${getNumberWithComma(fnlAmt)}원${stplPrdCd ? ` (${stplPrdCd}개월)` : ''}`;
  }
  if (sellTpCd === '3') {
    return `월${getNumberWithComma(fnlAmt)}원`;
  }
  if (sellTpCd === '6') {
    const svPrd = Math.max(Number(svVstPrdCd) || 0, Number(pcsvPrdCd) || 0);
    if (svPrd) {
      return `${getNumberWithComma(fnlAmt)}원 (월 ${getNumberWithComma(fnlAmt / svPrd)}원)`;
    }
  }
}

export function getPromotionAppliedPrice(finalPrice, appliedPromotions, sellDscCtrAmt = 0) {
  if (!appliedPromotions?.length) {
    return;
  }
  const { fnlVal } = { ...finalPrice };
  if (!fnlVal) {
    return;
  }
  const pmotAplyFnlVal = getFnlAmt(fnlVal, appliedPromotions, sellDscCtrAmt);
  if (fnlVal === pmotAplyFnlVal) {
    return;
  }
  const promotionApplied = {
    ...finalPrice,
    fnlVal: pmotAplyFnlVal,
  };
  return getDisplayedPrice(promotionApplied);
}

export function getDisplayPriceByCntrDtl(cntrDtl) {
  if (!cntrDtl) { return undefined; }
  const { fnlAmt, svPrd, sellTpCd, stplPtrm } = cntrDtl;
  if (sellTpCd === '1') {
    return `${getNumberWithComma(fnlAmt)}원`;
  }
  if (sellTpCd === '2') {
    return `${getNumberWithComma(fnlAmt)}원${stplPtrm ? ` (${stplPtrm}개월)` : ''}`;
  }
  if (sellTpCd === '3') {
    return `월${getNumberWithComma(fnlAmt)}원`;
  }
  if (sellTpCd === '6') {
    if (svPrd && svPrd > 1) {
      return `${getNumberWithComma(fnlAmt)}원 (월 ${getNumberWithComma(fnlAmt / svPrd)}원)`;
    }
    return `${getNumberWithComma(fnlAmt)}원`;
  }
}
