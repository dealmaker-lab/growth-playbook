# WordPress Proxy Setup

Serve the Growth Playbook at `appsamurai.com/e-book/growth-playbook` while the app runs on Vercel.

## Prerequisites

1. Set the Vercel environment variable:
   ```
   NEXT_PUBLIC_BASE_PATH=/e-book/growth-playbook
   ```
2. Redeploy on Vercel so the app builds with the base path baked in.

---

## Option A: nginx reverse proxy

Add this inside your existing `server` block for `appsamurai.com`:

```nginx
location /e-book/growth-playbook/ {
    proxy_pass https://growth-playbook-six.vercel.app/e-book/growth-playbook/;

    proxy_ssl_server_name on;
    proxy_set_header Host growth-playbook-six.vercel.app;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Pass cookies through (email-gate unlock cookie)
    proxy_pass_header Set-Cookie;
    proxy_cookie_path /e-book/growth-playbook /e-book/growth-playbook;

    # Next.js assets
    proxy_buffering off;
}

# Next.js static assets when served under basePath
location /e-book/growth-playbook/_next/ {
    proxy_pass https://growth-playbook-six.vercel.app/e-book/growth-playbook/_next/;
    proxy_ssl_server_name on;
    proxy_set_header Host growth-playbook-six.vercel.app;
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

Reload nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Option B: Apache reverse proxy

Enable required modules:
```bash
sudo a2enmod proxy proxy_http proxy_wstunnel ssl headers
sudo systemctl restart apache2
```

Add to your VirtualHost:
```apache
SSLProxyEngine On
ProxyPreserveHost Off

ProxyPass /e-book/growth-playbook/ https://growth-playbook-six.vercel.app/e-book/growth-playbook/
ProxyPassReverse /e-book/growth-playbook/ https://growth-playbook-six.vercel.app/e-book/growth-playbook/

# Cookie path rewrite
Header edit Set-Cookie "^(.*)Path=/e-book/growth-playbook(.*)$" "$1Path=/e-book/growth-playbook$2"

# Static assets caching
<Location "/e-book/growth-playbook/_next/">
    Header set Cache-Control "public, max-age=31536000, immutable"
</Location>
```

---

## Cookie considerations

The email-gate unlock cookie is set with:
- **Name:** `playbook_unlocked`
- **Path:** `/` (works for both standalone Vercel and proxied setups)
- **Max-Age:** 90 days
- **SameSite:** `Lax`

If the cookie path is changed to `/e-book/growth-playbook` in the future, update the `proxy_cookie_path` (nginx) or `Header edit` (Apache) directives accordingly.

When running behind a proxy, ensure the cookie `Secure` flag aligns with the parent domain's HTTPS setup. Since `appsamurai.com` uses HTTPS, this should work out of the box.

---

## Testing checklist

1. **Basic load:** Visit `appsamurai.com/e-book/growth-playbook` and confirm the playbook renders.
2. **Static assets:** Open DevTools Network tab. All `_next/static/` requests should return 200.
3. **Email gate:** Enter an email. Confirm the cookie is set and content unlocks.
4. **Return visit:** Close and reopen the browser. The playbook should remain unlocked (cookie persists).
5. **Calculator:** Navigate to `appsamurai.com/e-book/growth-playbook/calculator` and confirm it works.
6. **API routes:** Verify `POST /e-book/growth-playbook/api/unlock` returns 200 with valid email.
7. **Open Graph:** Paste the URL into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and confirm the preview image and title render.
8. **Mobile:** Test on a real phone to check responsive layout through the proxy.
9. **Robots/Sitemap:** Confirm `/e-book/growth-playbook/robots.txt` and `/e-book/growth-playbook/sitemap.xml` return correct content with the base path.
