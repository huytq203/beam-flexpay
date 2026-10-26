from PIL import Image, ImageDraw, ImageFilter
from collections import deque
import json, io, base64
im=Image.open('../images/6.webp').convert('RGB'); W,H=im.size; px=im.load()
fg=Image.new('L',(W,H),0); fp=fg.load()
for y in range(H):
    for x in range(W):
        if max(px[x,y])>34: fp[x,y]=255
dil=fg.filter(ImageFilter.MaxFilter(9)); dp=dil.load()
lab=[[0]*W for _ in range(H)]; n=0; boxes={}
for y in range(H):
    for x in range(W):
        if dp[x,y] and not lab[y][x]:
            n+=1; q=deque([(x,y)]); lab[y][x]=n
            while q:
                cx,cy=q.popleft()
                for nx,ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
                    if 0<=nx<W and 0<=ny<H and dp[nx,ny] and not lab[ny][nx]:
                        lab[ny][nx]=n; q.append((nx,ny))
def region(ids,xr=None):
    # điểm ảnh gốc thuộc các thành phần, tùy chọn giới hạn theo cột
    pts={}
    for y in range(H):
        row=lab[y]
        for x in range(W):
            if row[x] in ids and max(px[x,y])>34 and (xr is None or xr[0]<=x<xr[1]):
                pts[(x,y)]=px[x,y]
    return pts
def split_x(ids,n):
    pts=region(ids); xs=[p[0] for p in pts]; x0,x1=min(xs),max(xs)
    col={}
    for (x,y) in pts: col[x]=col.get(x,0)+1
    cuts=[]
    for k in range(1,n):
        tgt=x0+(x1-x0)*k/n; best=min(range(int(tgt-18),int(tgt+18)),key=lambda c:col.get(c,0)); cuts.append(best)
    edges=[x0-1]+cuts+[x1+1]
    return [(edges[i],edges[i+1]) for i in range(n)]
SPEC={}
def add(name,ids,xr=None): SPEC[name]=(ids,xr)
for i,c in enumerate([4,5,6],1): add(f'idle{i}',[c])
for i,c in enumerate([8,9,10,11,7],1): add(f'walk{i}',[c])
for k,xr in enumerate(split_x([12],2)): add(f'walk{6+k}',[12],xr)
add('walk8',[13])
for i,c in enumerate([14,15,16,17,18],1): add(f'run{i}',[c])
for i,c in enumerate([42,44,43],1): add(f'turn{i}',[c])
for i,c in enumerate([45,46,47,48],1): add(f'phone{i}',[c])
add('jump1',[40]); add('jump3',[49,55]); add('land4',[51]); add('fall5',[54]); add('fall6',[53])
for i,c in enumerate([52,50,41,39],1): add(f'step{i}',[c])
for i,c in enumerate([85,86,79,75],1): add(f'sit{i}',[c])
for i,c in enumerate([76,80,81,82,77,78],1): add(f'munch{i}',[c])
for k,xr in enumerate(split_x([83],2)): add(f'push{1+k}',[83],xr)
for k,xr in enumerate(split_x([84],2)): add(f'push{3+k}',[84],xr)
for i,c in enumerate([112,113,114,108,107],1): add(f'selfie{i}',[c])
for i,c in enumerate([116,118,117],1): add(f'cheer{i}',[c])
for k,xr in enumerate(split_x([106],2)): add(f'cheer{4+k}',[106],xr)
for i,c in enumerate([110,109,111,115],1): add(f'nod{i}',[c])
for i,c in enumerate([134,135,136,133],1): add(f'wave{i}',[c])
for i,c in enumerate([137,138,139],1): add(f'doze{i}',[c])
def isgray(p): r,g,b=p; return abs(r-g)<16 and abs(g-b)<18 and 40<max(p)<145
out={}
for name,(ids,xr) in SPEC.items():
    pts=region(ids,xr)
    if name.startswith(('jump','land','fall','step')):
        pts={k:v for k,v in pts.items() if not isgray(v)}
    def uig(v): return v[0]<75 and v[1]>100 and v[2]<125 and v[1]>v[0]+55
    if name.startswith('push'):
        # thanh tìm kiếm: ô trắng lớn nhất + viền xanh + biểu tượng kính lúp
        wh=[k for k,v in pts.items() if min(v)>238]
        seen=set(); best=[]
        for k in wh:
            if k in seen: continue
            comp=[k]; seen.add(k); q=[k]
            while q:
                cx,cy=q.pop()
                for nb in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
                    if nb in pts and nb not in seen and min(pts[nb])>238: seen.add(nb); comp.append(nb); q.append(nb)
            if len(comp)>len(best): best=comp
        xs=[p[0] for p in best]; ys=[p[1] for p in best]
        bx0,bx1,by0,by1=min(xs)-5,max(xs)+5,min(ys)-5,max(ys)+5
        gx=[k[0] for k,v in pts.items() if uig(v) and by0-4<=k[1]<=by1+4 and k[0]>bx1-8]
        if gx: bx1=max(gx)+2
        def keep(k,v):
            if bx0<=k[0]<=bx1:
                if k[1]>by1: return False
                if k[1]>=by0: return v[0]>v[1]+22
            return not uig(v) or k[1]<by0-12
        pts={k:v for k,v in pts.items() if keep(k,v)}
        meta_bar=(bx0,by0,bx1,by1)
        out.setdefault('_bar',{})[name]=meta_bar
    else:
        ymax=max(k[1] for k in pts)
        ug=[k for k,v in pts.items() if uig(v) and k[1]>=ymax-36]
        if len(ug)>25:
            bx0=min(p[0] for p in ug)-1; bx1=max(p[0] for p in ug)+1; by0=min(p[1] for p in ug)-1; by1=max(p[1] for p in ug)+1
            pts={k:v for k,v in pts.items() if not (bx0<=k[0]<=bx1 and by0<=k[1]<=by1)}
    if name in ('cheer4','cheer5'):
        pts={k:v for k,v in pts.items() if not (886<=k[0]<=938 and 722<=k[1]<=770 and not (v[1]<v[0]-35 or v[1]>v[0]+25))}
    # bỏ đốm nhỏ rời rạc
    left=set(pts); keepp={}
    while left:
        s0=left.pop(); comp=[s0]; q=[s0]
        while q:
            cx,cy=q.pop()
            for dx in (-1,0,1):
                for dy in (-1,0,1):
                    nb=(cx+dx,cy+dy)
                    if nb in left: left.discard(nb); comp.append(nb); q.append(nb)
        if len(comp)>=30:
            for k in comp: keepp[k]=pts[k]
    pts=keepp
    if not pts: print('trống',name); continue
    xs=[k[0] for k in pts]; ys=[k[1] for k in pts]
    x0,y0,x1,y1=min(xs),min(ys),max(xs),max(ys)
    fr=Image.new('RGBA',(x1-x0+1,y1-y0+1),(0,0,0,0)); f=fr.load()
    for (x,y),v in pts.items(): f[x-x0,y-y0]=v+(255,)
    # neo ngang: tâm điểm xanh lá áo
    sx=cnt=0
    for (x,y),v in pts.items():
        if v[1]>150 and 100<v[0]<190 and v[2]<110 and v[1]>v[0]+25: sx+=x;cnt+=1
    ax=(sx/cnt if cnt>20 else (x0+x1)/2)-x0
    fr.save(f'fr/{name}.png')
    buf=io.BytesIO(); fr.save(buf,'WEBP',quality=92,method=6)
    bar=out.get('_bar',{}).get(name)
    out[name]={'w':fr.width,'h':fr.height,'ax':round(ax,1),'ay':fr.height,'b64':base64.b64encode(buf.getvalue()).decode(),
               'bar':[bar[0]-x0,bar[1]-y0,bar[2]-x0,bar[3]-y0] if bar else None}
out.pop('_bar',None)
json.dump(out,open('frames.json','w'))
print(len(out),'khung', sum(len(v['b64']) for v in out.values())//1024,'KB')
# bảng xem thử trên nền sáng và tối
names=list(out); cell=140; cols=12
rows=(len(names)+cols-1)//cols
for tag,bg in (('light',(246,250,249)),('dark',(10,30,28))):
    sh=Image.new('RGB',(cols*cell,rows*(cell+12)),bg); d=ImageDraw.Draw(sh)
    for i,nm in enumerate(names):
        f=Image.open(f'fr/{nm}.png'); x=(i%cols)*cell; y=(i//cols)*(cell+12)
        sh.paste(f,(x+int(cell/2-out[nm]['ax']),y+cell-f.height),f)
        d.text((x+2,y+cell-2),nm,fill=(200,0,0) if tag=='light' else (255,200,0))
    sh.save(f'frames-{tag}.png')
