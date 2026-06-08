import math, struct, zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTS = [ROOT/'app/public/favicon.ico', ROOT/'public/favicon.ico']
SVG_OUTS = [ROOT/'app/public/favicon.svg', ROOT/'public/favicon.svg']

# Tiny PNG encoder, RGBA
def png_bytes(width, height, pixels):
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(pixels[y][x])
    def chunk(t, data):
        return struct.pack('>I', len(data)) + t + data + struct.pack('>I', zlib.crc32(t + data) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b'')

def mix(a,b,t): return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(4))
def clamp(v,a,b): return max(a,min(b,v))

def render(n):
    bg1=(2,6,23,255); bg2=(7,17,31,255)
    blue=(56,189,248,255); green=(34,197,94,255); text=(226,232,240,255)
    pix=[]
    cx=cy=n/2
    for y in range(n):
        row=[]
        for x in range(n):
            # rounded dark tile / circle-ish fallback
            dx=(x+0.5-cx)/(n/2); dy=(y+0.5-cy)/(n/2)
            r=math.sqrt(dx*dx+dy*dy)
            t=clamp((x+y)/(2*n),0,1)
            c=mix(bg1,bg2,t)
            # soft cyan/green glow
            glow=max(0,1-math.sqrt(((x-n*.25)/(n*.55))**2+((y-n*.18)/(n*.55))**2))
            glow2=max(0,1-math.sqrt(((x-n*.82)/(n*.28))**2+((y-n*.18)/(n*.28))**2))
            c=(clamp(c[0]+int(blue[0]*glow*.22)+int(green[0]*glow2*.18),0,255),
               clamp(c[1]+int(blue[1]*glow*.22)+int(green[1]*glow2*.18),0,255),
               clamp(c[2]+int(blue[2]*glow*.22)+int(green[2]*glow2*.18),0,255),255)
            # transparent rounded corners for ICO feel
            corner = min(x+1,y+1,n-x,n-y)
            alpha=255
            if corner < n*.09:
                alpha=int(255*corner/(n*.09))
            row.append((c[0],c[1],c[2],alpha))
        pix.append(row)

    def draw_line(x1,y1,x2,y2,color,w):
        steps=max(abs(x2-x1),abs(y2-y1))*3+1
        for i in range(int(steps)+1):
            t=i/steps
            x=x1+(x2-x1)*t; y=y1+(y2-y1)*t
            rr=w/2
            for yy in range(int(y-rr-1), int(y+rr+2)):
                if yy<0 or yy>=n: continue
                for xx in range(int(x-rr-1), int(x+rr+2)):
                    if xx<0 or xx>=n: continue
                    d=math.hypot(xx+0.5-x, yy+0.5-y)
                    if d<=rr:
                        a=clamp(1-d/rr,0,1)
                        old=pix[yy][xx]
                        pix[yy][xx]=mix(old,color,a*.95)
    # gauge arc
    for a in [math.radians(v) for v in range(205,336)]:
        x=cx+math.cos(a)*n*.34; y=cy+math.sin(a)*n*.34
        for yy in range(int(y-n*.035), int(y+n*.035)+1):
            for xx in range(int(x-n*.035), int(x+n*.035)+1):
                if 0<=xx<n and 0<=yy<n and math.hypot(xx+0.5-x, yy+0.5-y) < n*.035:
                    pix[yy][xx]=mix(pix[yy][xx], blue, .8)
    # speed needle
    draw_line(n*.50,n*.58,n*.76,n*.34,green,max(2,n*.08))
    # center dot
    for yy in range(n):
        for xx in range(n):
            if math.hypot(xx+0.5-n*.5, yy+0.5-n*.58) < n*.085:
                pix[yy][xx]=text
    # lower bars
    for i,h in enumerate([.13,.21,.30]):
        x0=int(n*(.22+i*.15)); x1=int(x0+n*.08)
        y1=int(n*.80); y0=int(y1-n*h)
        for yy in range(y0,y1):
            for xx in range(x0,x1):
                pix[yy][xx]=mix(pix[yy][xx], green if i==2 else blue, .9)
    return png_bytes(n,n,pix)

imgs=[(16,render(16)),(32,render(32)),(48,render(48)),(64,render(64))]
header=struct.pack('<HHH',0,1,len(imgs))
offset=6+16*len(imgs)
entries=[]; body=b''
for size,data in imgs:
    entries.append(struct.pack('<BBBBHHII', size if size<256 else 0, size if size<256 else 0, 0, 0, 1, 32, len(data), offset))
    body += data; offset += len(data)
ico=header+b''.join(entries)+body
for out in OUTS:
    out.write_bytes(ico)

svg='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#020617"/><stop offset="1" stop-color="#07111f"/></linearGradient><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#22c55e"/></linearGradient></defs>
  <rect width="64" height="64" rx="14" fill="url(#b)"/>
  <circle cx="18" cy="12" r="22" fill="#38bdf8" opacity=".18"/>
  <path d="M15 41a18 18 0 0 1 34 0" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
  <path d="M32 38 48 23" stroke="#22c55e" stroke-width="6" stroke-linecap="round"/>
  <circle cx="32" cy="40" r="5" fill="#e2e8f0"/>
  <rect x="15" y="47" width="5" height="7" rx="2" fill="#38bdf8"/><rect x="25" y="43" width="5" height="11" rx="2" fill="#38bdf8"/><rect x="35" y="37" width="5" height="17" rx="2" fill="#22c55e"/>
</svg>'''
for out in SVG_OUTS:
    out.write_text(svg, encoding='utf-8')
print('wrote favicon.ico/svg')
