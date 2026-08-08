import { css } from 'lit';

export const componentStyles = css`
  .storage-warning { max-width:1200px; margin:0 auto; padding:12px 24px; background:#FFF4E5; border-left:4px solid var(--ytd-warning); font-size:14px; }
  .cart-layout { display:grid; grid-template-columns:minmax(0,1fr) 360px; gap:32px; align-items:start; }
  .restaurant-heading { display:flex; align-items:center; gap:8px; margin-bottom:16px; color:var(--ytd-primary-dark); font-weight:600; }
  .cart-items { display:grid; gap:16px; }
  .cart-item { display:grid; grid-template-columns:112px minmax(0,1fr); gap:16px; align-items:center; }
  .cart-item img { width:112px; height:92px; border-radius:12px; object-fit:cover; background:#eee; }
  .item-main { min-width:0; }
  .item-title-row { display:flex; justify-content:space-between; gap:12px; align-items:start; }
  .item-title-row h3, .item-title-row p { margin-bottom:4px; }
  .item-bottom { display:flex; justify-content:space-between; gap:16px; align-items:end; margin-top:12px; flex-wrap:wrap; }
  .quantity-control { display:flex; align-items:center; gap:4px; margin-top:4px; }
  .quantity-control output { min-width:28px; text-align:center; font-weight:700; }
  .item-total { font-weight:700; white-space:nowrap; }
  .summary { position:sticky; top:24px; }
  .summary-row { display:flex; justify-content:space-between; gap:16px; padding:8px 0; }
  .summary-total { border-top:1px solid var(--ytd-border); margin-top:8px; padding-top:16px; font-size:20px; font-weight:700; }
  .summary-actions { display:grid; gap:12px; margin-top:16px; }
  .delivery-estimate { display:flex; align-items:center; gap:8px; margin:16px 0; font-size:14px; color:var(--ytd-text-secondary); }
  .journey { margin:16px 0 8px; padding:12px; border-radius:16px; background:#F1F8E9; border:1px solid #C8E6C9; overflow:hidden; }
  .journey-copy { display:flex; justify-content:space-between; gap:8px; font-size:14px; font-weight:600; margin-bottom:8px; }
  .journey-track { position:relative; height:32px; }
  .journey-line { position:absolute; left:8px; right:8px; top:15px; height:4px; border-radius:999px; background:#D7E6D3; }
  .journey-progress { position:absolute; left:8px; top:15px; height:4px; width:calc((100% - 16px) * var(--journey)); border-radius:999px; background:var(--ytd-primary); transition:width 180ms ease; }
  .journey-bag { position:absolute; top:2px; left:calc(8px + (100% - 32px) * var(--journey)); width:28px; height:28px; border-radius:999px; background:var(--ytd-surface); border:2px solid var(--ytd-primary); display:grid; place-items:center; color:var(--ytd-primary-dark); transition:left 220ms ease; box-shadow:var(--ytd-shadow); }
  .journey-goal { position:absolute; right:4px; top:4px; color:var(--ytd-primary-dark); }
  .mobile-checkout { display:none; }
  .empty { min-height:480px; display:grid; place-items:center; text-align:center; }
  .empty-inner { max-width:480px; }
  .mascot-placeholder { width:160px; height:136px; border-radius:48px; margin:0 auto 32px; border:2px dashed #9EBA9E; background:#EFF7ED; display:grid; place-items:center; color:var(--ytd-primary-dark); font-size:14px; font-weight:600; padding:16px; }
.stepper {
  width: 100%;
  margin: 0 0 32px;
  padding: 16px 24px;
  border: 1px solid var(--ytd-border);
  border-radius: 16px;
  background: var(--ytd-surface);
  box-shadow: var(--ytd-shadow);
}

.stepper-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: 820px;
  margin-inline: auto;
}
  .step { position:relative; display:grid; justify-items:center; gap:8px; text-align:center; color:var(--ytd-text-secondary); font-size:14px; }
  .step:not(:last-child)::after { content:''; position:absolute; left:calc(50% + 20px); right:calc(-50% + 20px); top:17px; height:2px; background:var(--ytd-border); }
  .step.completed:not(:last-child)::after { background:var(--ytd-primary); }
  .step-circle { width:36px; height:36px; border-radius:999px; border:2px solid var(--ytd-border); background:var(--ytd-surface); display:grid; place-items:center; font-weight:700; position:relative; z-index:1; }
  .step.current { color:var(--ytd-text-primary); font-weight:700; }
  .step.current .step-circle { border-color:var(--ytd-primary); color:var(--ytd-primary-dark); box-shadow:0 0 0 4px #E8F5E9; }
  .step.completed { color:var(--ytd-primary-dark); font-weight:600; }
  .step.completed .step-circle { border-color:var(--ytd-primary); background:var(--ytd-primary); color:#fff; }
.checkout-shell {
  display: grid;
  grid-template-columns: minmax(0, 760px) minmax(260px, 320px);
  gap: 32px;
  align-items: start;
  justify-content: center;
}

.checkout-column {
  min-width: 0;
  max-width: none;
  margin: 0;
  display: grid;
  gap: 24px;
}
    .mode-toggle { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:4px; border:1px solid var(--ytd-border); border-radius:16px; background:#F2F3F0; }
  .mode-toggle button { min-height:44px; border:0; border-radius:12px; background:transparent; cursor:pointer; font-weight:600; color:var(--ytd-text-secondary); }
  .mode-toggle button[aria-pressed='true'] { background:var(--ytd-surface); color:var(--ytd-primary-dark); box-shadow:var(--ytd-shadow); }
  .saved-address { display:flex; gap:12px; align-items:flex-start; border:2px solid var(--ytd-primary); background:#F3FAF2; }
  .label-options { border:0; padding:0; margin:0; display:flex; gap:16px; flex-wrap:wrap; }
  .label-options legend { width:100%; font-size:14px; font-weight:600; margin-bottom:4px; }
  .label-options label { min-height:44px; display:flex; align-items:center; gap:8px; cursor:pointer; }
  .label-options input { width:20px; height:20px; accent-color:var(--ytd-primary); }
  .checkout-actions { justify-content:space-between; }
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .form-grid .wide { grid-column:1 / -1; }
  .field-wrap { display:grid; gap:4px; }
  .native-field label { display:block; font-size:14px; font-weight:600; margin-bottom:4px; }
  .native-field input, .native-field select { width:100%; min-height:52px; padding:0 12px; border:1px solid #777; border-radius:12px; background:var(--ytd-surface); color:var(--ytd-text-primary); }
  .native-field input[aria-invalid='true'], .native-field select[aria-invalid='true'] { border:2px solid var(--ytd-error); }
  .choice-group { display:grid; gap:12px; }
  .choice-card { position:relative; display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:12px; align-items:center; padding:16px; border:1px solid var(--ytd-border); border-radius:16px; background:var(--ytd-surface); cursor:pointer; transition:border-color 150ms ease,background 150ms ease,transform 150ms ease; }
  .choice-card:has(input:checked) { border:2px solid var(--ytd-primary); background:#F3FAF2; }
  .choice-card input { width:20px; height:20px; accent-color:var(--ytd-primary); }
  .choice-card .selected-check { visibility:hidden; color:var(--ytd-primary-dark); }
  .choice-card:has(input:checked) .selected-check { visibility:visible; }
  .card-fields { margin-top:16px; display:grid; gap:16px; }
  .card-fields-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .demo-note { display:flex; gap:8px; align-items:flex-start; padding:12px; border-radius:12px; background:#F4F5F2; color:var(--ytd-text-secondary); font-size:14px; }
  .review-list { display:grid; gap:8px; }
  .review-item { display:flex; justify-content:space-between; gap:16px; padding:8px 0; border-bottom:1px solid var(--ytd-border); }
  .review-detail { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:16px; padding:12px 0; align-items:start; }
  .review-detail strong { display:block; }
  .place-order { width:100%; --md-filled-button-container-height:52px; box-shadow:var(--ytd-shadow); }
  .processing { display:flex; align-items:center; gap:12px; padding:16px; border-radius:12px; background:#F3FAF2; border:1px solid #C8E6C9; }
  .processing md-linear-progress { flex:1; min-width:100px; }
  .payment-failure { border-left:4px solid var(--ytd-error); }
  .wallet-warning { margin-top:12px; padding:12px; border-radius:12px; background:#FFF4E5; border:1px solid #F4B76B; }
  .confirmation { max-width:760px; margin:0 auto; text-align:center; }
  .success-check { width:72px; height:72px; margin:0 auto 16px; border-radius:999px; background:#E8F5E9; color:var(--ytd-success); display:grid; place-items:center; animation:success-pop 420ms ease-out; }
  .success-check .material-symbols-outlined { font-size:44px; }
  .checkout-companion {
  position: sticky;
  top: 24px;

  overflow: hidden;
  min-width: 0;

  padding: 24px;
  border: 1px solid #C8E6C9;
  border-radius: 16px;

  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(245, 124, 0, 0.14),
      transparent 38%
    ),
    linear-gradient(
      160deg,
      #F3FAF2,
      #FFFFFF
    );

  box-shadow: var(--ytd-shadow);
}
.checkout-shell--confirmation .confirmation {
  width: 100%;
  max-width: none;
  margin: 0;
}
.checkout-companion::after {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  right: -48px;
  bottom: -48px;

  border: 24px solid rgba(46, 125, 50, 0.06);
  border-radius: 999px;

  pointer-events: none;
}

.companion-sticker {
  display: inline-block;
  margin-bottom: 24px;
  padding: 4px 12px;

  border-radius: 999px;

  background: var(--ytd-cta);
  color: var(--ytd-text-primary);

  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;

  transform: rotate(-2deg);
}

.demo-credit-card {
  width: min(100%, 420px);
  min-height: 220px;
  margin: 8px auto 8px;
  padding: 24px;
  border-radius: 16px;
  box-sizing: border-box;

  background:
    radial-gradient(
      circle at 85% 20%,
      rgba(245, 124, 0, 0.28),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      var(--ytd-primary-dark),
      var(--ytd-primary)
    );

  color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  overflow: hidden;
}

.demo-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.demo-card-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
}

.demo-card-badge {
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--ytd-cta);
  color: var(--ytd-text-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.demo-card-chip {
  width: 44px;
  height: 32px;
  margin-top: 24px;
  border-radius: 8px;
  background:
    linear-gradient(
      135deg,
      #F5D77A,
      #C7A437
    );
}

.demo-card-number {
  margin: 24px 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
}

.demo-card-bottom {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
}

.demo-card-bottom > div {
  display: grid;
  gap: 4px;
}

.demo-card-label {
  display: block;
  font-size: 11px;
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.demo-card-bottom strong {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-simulation-copy {
  text-align: center;
  margin: 0;
}
.companion-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 16px;

  display: grid;
  place-items: center;

  border-radius: 16px;

  background: var(--ytd-primary);
  color: #FFFFFF;
}

.companion-icon .material-symbols-outlined {
  font-size: 32px;
}

.checkout-companion h2 {
  margin-bottom: 8px;
  font-size: 24px;
}

.checkout-companion > p {
  color: var(--ytd-text-secondary);
}

.companion-facts {
  display: grid;
  gap: 8px;
  margin-top: 24px;
}

.companion-facts > div {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
  align-items: center;

  padding: 12px;

  border: 1px solid var(--ytd-border);
  border-radius: 12px;

  background: rgba(255, 255, 255, 0.78);
}

.companion-facts .material-symbols-outlined {
  color: var(--ytd-primary-dark);
}

.companion-facts span:last-child {
  min-width: 0;
}

.companion-facts strong {
  display: block;
  font-size: 14px;
}

.companion-facts small {
  display: block;
  margin-top: 4px;

  color: var(--ytd-text-secondary);
  font-size: 12px;
}

.companion-signoff {
  position: relative;
  z-index: 1;

  margin: 24px 0 0 !important;
  padding-top: 16px;

  border-top: 1px dashed #A5C9A7;

  color: var(--ytd-primary-dark) !important;
  font-size: 14px;
}

.checkout-companion--success {
  border-color: #A5D6A7;
}
  @keyframes success-pop { from { transform:scale(.75); opacity:0; } to { transform:scale(1); opacity:1; } }
  .confirmation-card { margin-top:24px; text-align:left; }
  .confirmation-actions { justify-content:center; margin-top:24px; }
  .snackbar { position:fixed; z-index:30; left:50%; bottom:24px; transform:translateX(-50%); min-width:min(420px,calc(100vw - 32px)); background:#2B2B2B; color:#fff; border-radius:12px; box-shadow:var(--ytd-shadow); padding:12px 16px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .snackbar button { border:0; background:transparent; color:#A5D6A7; min-height:44px; padding:0 8px; font-weight:700; cursor:pointer; }
  .skeleton-grid { display:grid; grid-template-columns:minmax(0,1fr) 360px; gap:32px; }
  .skeleton-list { display:grid; gap:16px; }
  .skeleton { border-radius:16px; min-height:120px; background:linear-gradient(90deg,#eceeea 25%,#f7f8f5 50%,#eceeea 75%); background-size:200% 100%; animation:shimmer 1.1s infinite; }
  .skeleton.summary-skeleton { min-height:320px; }
  @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }

  @media (min-width:600px) and (max-width:959px) {
  .checkout-shell {
  grid-template-columns: 1fr;
}

.checkout-companion {
  position: static;

  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 24px;
  align-items: start;
}

.checkout-companion .companion-sticker {
  grid-column: 1 / -1;
}

.checkout-companion .companion-icon {
  grid-column: 1;
}

.checkout-companion h2,
.checkout-companion > p {
  grid-column: 2;
}

.companion-facts,
.companion-signoff {
  grid-column: 1 / -1;
}

.companion-facts {
  grid-template-columns: repeat(3, 1fr);
}
    .cart-layout, .skeleton-grid { grid-template-columns:1fr; }
    .summary { position:static; }
  }
  @media (max-width:599px) {
  .demo-credit-card {
  min-height: 200px;
  padding: 16px;
}
  .stepper {
  padding: 12px 8px;
  margin-bottom: 24px;
}

.checkout-shell {
  grid-template-columns: 1fr;
  gap: 24px;
}

.checkout-companion {
  position: static;
  padding: 16px;
}

.checkout-companion .companion-icon {
  width: 44px;
  height: 44px;
}

.checkout-companion .companion-icon .material-symbols-outlined {
  font-size: 24px;
}

.checkout-companion h2 {
  font-size: 20px;
}

.companion-facts {
  margin-top: 16px;
}

.companion-signoff {
  margin-top: 16px !important;
}

.demo-card-number {
  font-size: 17px;
  letter-spacing: 0.05em;
}

.demo-card-bottom {
  gap: 16px;
}
    .storage-warning { padding:12px 16px; }
    .cart-layout, .skeleton-grid { grid-template-columns:1fr; gap:24px; }
    .cart-item { grid-template-columns:84px minmax(0,1fr); align-items:start; }
    .cart-item img { width:84px; height:84px; }
    .item-bottom { align-items:center; }
    .item-total { justify-self:end; }
    .checkout-actions { display:grid; grid-template-columns:1fr; }
    .summary { position:static; margin-bottom:8px; }
    .summary .summary-actions { display:none; }
    .mobile-checkout { position:fixed; z-index:20; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:8px 16px calc(8px + env(safe-area-inset-bottom)); background:var(--ytd-surface); border-top:1px solid var(--ytd-border); box-shadow:var(--ytd-shadow); }
    .mobile-checkout strong { display:block; }
    .form-grid, .card-fields-row { grid-template-columns:1fr; }
    .form-grid .wide { grid-column:auto; }
    .stepper { padding-bottom:4px; }
    .stepper-list { min-width:0; }
    .step { font-size:12px; }
    .choice-card { grid-template-columns:auto minmax(0,1fr) auto; }
    .snackbar { bottom:calc(48px + 32px); }

  }
    .status-mascot {
  display: block;
  width: 180px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  margin: 0 auto 24px;
}

.status-mascot--empty {
  width: 180px;
}

.status-mascot--success {
  width: 180px;
  margin-bottom: 12px;
}

.status-mascot--session {
  width: 160px;
}

.dialog-mascot {
  display: block;
  width: 120px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  margin: 0 auto 16px;
}

@media (max-width: 599px) {
  .status-mascot--empty,
  .status-mascot--success {
    width: 150px;
  }

  .status-mascot--session {
    width: 135px;
  }

  .dialog-mascot {
    width: 100px;
  }
}

`;
