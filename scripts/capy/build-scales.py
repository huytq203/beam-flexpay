from PIL import Image, ImageDraw
import json, re, statistics
fr=json.load(open('frames.json'))
def green(p): r,g,b,a=p; return a>200 and g>150 and 90<r<190 and b<110 and g>r+25
def headh(n):
    im=Image.open(f'fr/{n}.png').convert('RGBA'); w,h=im.size; px=im.load()
    rows=[sum(1 for x in range(w) if green(px[x,y])) for y in range(h)]
    y=0
    while y<h and rows[y]<3: y+=1
    top=y
    while y<h and rows[y]>=3: y+=1
    while y<h and rows[y]<6: y+=1
    return y-top
grp=lambda n: re.sub(r'\d+$','',n)
hh={}
for n in fr: hh.setdefault(grp(n),[]).append(headh(n))
TARGET=65
scale={g:round(TARGET/statistics.median(v),3) for g,v in hh.items()}
scale.update({'doze':1.15,'nod':1.2,'wave':1.25,'land':1.3,'jump':1.3,'cheer':1.15})
json.dump({n:scale[grp(n)] for n in fr},open('scales.json','w'))
print({g:scale[g] for g in sorted(scale)})
names=['idle1','turn1','walk1','run1','phone2','jump3','land4','sit2','munch2','selfie2','cheer1','nod1','wave1','push1','doze1']
cell=130; sh=Image.new('RGB',(cell*len(names),cell+14),(246,250,249)); d=ImageDraw.Draw(sh)
for i,n in enumerate(names):
    f=Image.open(f'fr/{n}.png'); s=scale[grp(n)]; z=0.62*s*1.0
    f=f.resize((max(1,round(f.width*z)),max(1,round(f.height*z))),Image.LANCZOS)
    sh.paste(f,(i*cell+cell//2-int(fr[n]['ax']*z),cell-f.height),f); d.text((i*cell+2,cell),n,fill=(200,0,0))
sh=sh.resize((sh.width*1,sh.height*1)); sh.save('scaled-check.png')
