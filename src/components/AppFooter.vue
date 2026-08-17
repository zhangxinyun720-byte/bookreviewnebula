<script setup>
import { siteText } from '@/config/site'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container container--wide footer-inner">
      <span class="footer-text">{{ siteText.footer.copyright(year) }}</span>
      <span class="footer-sub muted">{{ siteText.footer.builtWith }}</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  background: var(--surface);
  padding: 24px 0;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.footer-text { font-size: 0.84rem; color: var(--text-soft); }
.footer-sub { font-size: 0.78rem; }

@media (max-width: 640px) {
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>
