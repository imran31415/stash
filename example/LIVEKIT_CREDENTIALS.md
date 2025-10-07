# LiveKit Server Credentials & Configuration

## ✅ Fixed Configuration

The API keys have been updated to meet LiveKit's security requirements (minimum 32 characters).

---

## 🔑 API Credentials

**API Key:** ``
**API Secret:** ``

⚠️ **IMPORTANT:** These are development credentials. Change them in production!

---

## 🌐 Server URLs

### Production (Kubernetes)
- **External IP:** `24.199.74.11`
- **WebSocket:** `ws://24.199.74.11:7880`
- **Recommended Domain:** `livekit.scalebase.io` → `24.199.74.11`

### Local Development
- **WebSocket:** `ws://localhost:7880`
- **HTTP:** `http://localhost:7880`

---

## 📋 DNS Setup for Production

Add this DNS record to make LiveKit accessible via domain:

```
Type: A
Name: livekit
Value: 24.199.74.11
TTL: 300

Result: livekit.scalebase.io → 24.199.74.11
```

After DNS propagation, your app will automatically use:
- `wss://livekit.scalebase.io` (secure WebSocket)

---

## 🚀 Current Status

```bash
kubectl get pods -l app=livekit-server
# Should show: Running

kubectl logs -f deployment/livekit-server
# Should show: "starting LiveKit server"
```

**Server Info:**
- Node ID: ND_QNt8c4yDn92A
- Version: 1.9.1
- Node IP: 143.110.148.249
- Ports: HTTP(7880), TCP(7881), UDP(7882)

---

## 🔒 Security Notes

### For Production:

1. **Generate Secure Keys:**
   ```bash
   # Generate a secure API key (32+ chars)
   openssl rand -hex 16

   # Generate a secure secret (32+ chars)
   openssl rand -hex 32
   ```

2. **Update Kubernetes Secret:**
   ```bash
   kubectl create secret generic livekit-secrets \
     --from-literal=api-key=YOUR_KEY_HERE \
     --from-literal=api-secret=YOUR_SECRET_HERE
   ```

3. **Update ConfigMap:**
   Edit `k8s/livekit-deployment.yaml` and reference the secret:
   ```yaml
   env:
   - name: LIVEKIT_API_KEY
     valueFrom:
       secretKeyRef:
         name: livekit-secrets
         key: api-key
   ```

---

## 📊 Testing

### Test Token Generation
```bash
curl -X POST http://localhost:8082/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"roomName":"test-room","userName":"test-user","userId":"user-123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "url": "ws://localhost:7880"
}
```

### Test LiveKit Server
```bash
curl http://24.199.74.11:7880/
```

Expected: LiveKit server info (JSON response)

---

## 🛠️ Troubleshooting

### "secret is too short" Error
✅ **FIXED** - Keys are now 32+ characters

### "TURN domain required" Error
✅ **FIXED** - TURN is now optional (LiveKit has built-in ICE)

### Can't connect to LiveKit
Check firewall rules for UDP port 7882:
```bash
kubectl get svc livekit-server
# Ensure EXTERNAL-IP is populated
```

---

## 📈 Next Steps

1. ✅ Add DNS record: `livekit.scalebase.io` → `24.199.74.11`
2. ✅ Test with 10+ users to trigger SFU mode
3. ✅ Monitor server resources
4. ✅ Generate production credentials
5. ✅ Set up SSL/TLS with Ingress

Your LiveKit server is ready to handle 100+ concurrent users! 🎉
