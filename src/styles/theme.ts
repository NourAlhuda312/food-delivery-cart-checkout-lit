import { css } from 'lit';

export const themeStyles = css`
  :host {
    --ytd-primary: #2E7D32;
    --ytd-primary-dark: #1B5E20;
    --ytd-cta: #F57C00;
    --ytd-cta-dark: #E65100;
    --ytd-background: #F7F8F5;
    --ytd-surface: #FFFFFF;
    --ytd-text-primary: #1F1F1F;
    --ytd-text-secondary: #616161;
    --ytd-border: #E0E0E0;
    --ytd-success: #2E7D32;
    --ytd-warning: #ED6C02;
    --ytd-error: #D32F2F;
    --ytd-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: block;
    color: var(--ytd-text-primary);
    background: var(--ytd-background);
    font-family: Roboto, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    min-height: 100%;
    box-sizing: border-box;
  }

  *, *::before, *::after { box-sizing: border-box; }
  h1,h2,h3,p { margin-top: 0; }
  h1 { font-size: 32px; line-height: 1.25; font-weight: 700; margin-bottom: 24px; }
  h2 { font-size: 24px; line-height: 1.3; font-weight: 700; margin-bottom: 16px; }
  h3 { font-size: 20px; line-height: 1.4; font-weight: 600; margin-bottom: 8px; }
  p { margin-bottom: 16px; }
  button, input, select { font: inherit; }
  button:focus-visible, input:focus-visible, select:focus-visible, [tabindex]:focus-visible {
    outline: 2px solid var(--ytd-primary);
    outline-offset: 2px;
  }

  md-filled-button {
    --md-filled-button-container-color: var(--ytd-cta);
    --md-filled-button-label-text-color: var(--ytd-text-primary);
    --md-filled-button-hover-label-text-color: var(--ytd-text-primary);
    --md-filled-button-pressed-label-text-color: var(--ytd-text-primary);
    --md-filled-button-container-shape: 12px;
    --md-filled-button-label-text-font: Roboto, Arial, sans-serif;
    --md-filled-button-label-text-weight: 600;
    min-height: 44px;
  }
  md-filled-button:hover { --md-filled-button-container-color: var(--ytd-cta-dark); }
  md-outlined-button, md-text-button {
    --md-outlined-button-container-shape: 12px;
    --md-outlined-button-label-text-color: var(--ytd-primary-dark);
    --md-outlined-button-outline-color: var(--ytd-primary);
    --md-text-button-label-text-color: var(--ytd-primary-dark);
    min-height: 44px;
  }
  md-icon-button { min-width: 44px; min-height: 44px; }
  md-outlined-text-field { width: 100%; --md-outlined-text-field-container-shape: 12px; }
  md-dialog { --md-dialog-container-shape: 20px; }

  .page { max-width: 1200px; margin: 0 auto; padding: 32px 24px 48px; min-height: 560px; }
  .card { background: var(--ytd-surface); border: 1px solid var(--ytd-border); border-radius: 16px; box-shadow: var(--ytd-shadow); padding: 16px; }
  .supporting { color: var(--ytd-text-secondary); font-size: 14px; }
  .error-text { color: var(--ytd-error); font-size: 14px; margin: 4px 0 0; }
  .visually-hidden { position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important; }
  .actions { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
  .material-symbols-outlined { font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal; font-size:24px; line-height:1; letter-spacing:normal; text-transform:none; display:inline-block; white-space:nowrap; word-wrap:normal; direction:ltr; -webkit-font-feature-settings:'liga'; -webkit-font-smoothing:antialiased; font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }

  @media (max-width: 599px) {
    .page { padding: 24px 16px calc(48px + 32px); }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
  }
`;
