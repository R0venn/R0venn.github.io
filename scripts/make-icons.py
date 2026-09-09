from PIL import Image,ImageDraw,ImageFont
for size in [192,512]:
 im=Image.new('RGB',(size,size),'#173c4a')
 d=ImageDraw.Draw(im)
 font=ImageFont.truetype('C:/Windows/Fonts/georgia.ttf',int(size*.65))
 d.text((size/2,size/2),'H',font=font,anchor='mm',fill='#efcc80')
 im.save('public/icon-'+str(size)+'.png')
