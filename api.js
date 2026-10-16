const API_LIST = `
## Şikayet|0
abuse/market|Market uygulamasını şikayet et|#app_id,reason_text
## Rozet|15
badge/add|Rozet ekle|#group_id,name,nick,description,image,level
badge/all|Tüm rozetleri getir|
badge/give|Rozet ver|#badge_id,#user_id
badge/list|Grup rozetlerini listele|#group_id,group_nick
## Kanal|30
channel/add|Kanal oluştur|#group_id,nick,title,description,#type,data,read_role_ids,write_role_ids,control_role_ids,read_plus_user_ids,read_minus_user_ids,write_plus_user_ids,write_minus_user_ids,control_plus_user_ids,control_minus_user_ids
channel/del|Kanalı sil|#channel_id
channel/detail|Kanal kullanıcı izinlerini getir|#channel_id
channel/get|Kanal bilgisini getir|#channel_id
channel/list|Gruptaki kanalları listele|#group_id
channel/options/set|Kanal seçeneklerini değiştir|#channel_id,#add_read_plus_user_id,#del_read_plus_user_id,#add_read_minus_user_id,#del_read_minus_user_id,#add_write_plus_user_id,#del_write_plus_user_id,#add_write_minus_user_id,#del_write_minus_user_id,#add_control_plus_user_id,#del_control_plus_user_id,#add_control_minus_user_id,#del_control_minus_user_id
channel/set|Kanalı düzenle|#channel_id,nick,title,description,#type,data,read_role_ids,write_role_ids,control_role_ids,read_plus_user_ids,read_minus_user_ids,write_plus_user_ids,write_minus_user_ids,control_plus_user_ids,control_minus_user_ids
channel/show|Kanalı göster|group_nick,channel_nick
channel/show/info|Kanal bilgisini göster|#channel_id,group_nick,channel_nick
channel/sort|Kanalları sırala|#group_id,channel_ids
## Ekip|45
crew/add|Ekip oluştur|#group_id,name,color,image
crew/del|Ekibi sil|#crew_id
crew/get|Ekibi getir|#crew_id
crew/join|Ekibe katıl|#crew_id
crew/leave|Ekipten ayrıl|#crew_id
crew/list|Ekipleri listele|#group_id
crew/set|Ekibi düzenle|#crew_id,name,color,image
crew/sort|Ekipleri sırala|#group_id,crew_ids
## Favori|60
favorite/list|Favori kanalları listele|
favorite/toggle|Kanalı favoriye ekle/çıkar|#channel_id
## Arkadaş|75
friend/add|Arkadaş ekle / isteği kabul et|#user_id
friend/del|Arkadaşı sil|#user_id
friend/status|Arkadaşlık durumu|#user_id
## Grup|90
group/add|Grup oluştur|name,description
group/del|Grubu sil|#group_id
group/founder|Grup kurucusunu getir|#group_id
group/get|Grup bilgisini getir|#id,nick
group/join|Gruba katılma isteği gönder|#group_id
group/joinlist|Katılma isteklerini listele|#group_id
group/leave|Gruptan ayrıl|#group_id
group/list|Gruplarımı listele|
group/online|Çevrimiçi üyeleri getir|#group_id
group/popular|Popüler grupları getir|
group/set|Grubu düzenle|
group/set/home|Grup ana sayfasını değiştir|#group_id,home
group/set/permissions|Grup izinlerini ayarla|#group_id,#discover_me,#everyone_member,#abuse_filter,#enable_ads
group/set/profile|Grup profilini ayarla|#group_id,name,image,description
group/set/socials|Grup sosyal hesaplarını ayarla|social_instagram,social_x,social_youtube,social_tiktok,social_kick,social_twitch,social_github,social_steam,social_linkedin,social_website
group/sort|Grupları sırala|group_ids
## Market|105
market/api/get|Uygulama anahtarını getir|#app_id
market/api/reset|Uygulama anahtarını sıfırla|
market/add|Uygulama oluştur|name,#app_type_id,description
market/app/install|Uygulamayı gruba yükle|#app_id,#group_id
market/comment/add|Uygulamaya yorum ekle|#app_id,#rate,text
market/comment/list|Uygulama yorumlarını listele|#app_id
market/get|Uygulamayı getir|#app_id
market/hide|Uygulamayı gizle/sil|#app_id
market/library/add|Kütüphaneye ekle|#app_id
market/library/del|Kütüphaneden çıkar|#app_id
market/library/list|Kütüphanemi listele|
market/list|Market'i listele|app_type_ids,#publisher_id,search,#verified,#limit
market/myapps|Uygulamalarımı getir|
market/publisher/get|Yayıncıyı getir|#publisher_id
market/revision/get|Son revizyonu getir|#app_id
market/revision/publish|Revizyonu yayınla|#app_id
market/revision/set/content|Revizyon içeriğini ayarla|#app_id,name,description,image,icon
market/revision/set/detail|Revizyon ayrıntısını ayarla|#app_id,link,css,webhook,#app_type_id
## Üye|120
member/get|Üyeyi getir|#group_id,#user_id,user_nick
member/info|Üyelik bilgimi getir|#group_id
member/kick|Üyeyi gruptan at|#group_id,#user_id
member/list|Üyeleri listele|#group_id
member/role/set|Üyenin rollerini ayarla|#group_id,#user_id,role_ids
member/waiter/accept|Katılma isteğini kabul et|#group_id,#user_id
member/waiter/reject|Katılma isteğini reddet|#group_id,#user_id
## Özel mesaj|135
message/get|Mesajları getir|#user_id
message/get/user|Kullanıcıdan mesajları getir|#user_id
message/list/user|Mesajlaştığım kullanıcıları listele|
message/read|Mesajları okundu yap|#user_id
message/send|Özel mesaj gönder|#user_id,message
## Bildirim|150
notification/get/push/key|Push anahtarını getir|
notification/list|Bildirimleri listele|
notification/read|Bildirimi okundu yap|#id
notification/read/all|Tüm bildirimleri okundu yap|#type
notification/set/push/endpoint|Push uç noktasını ayarla|endpoint
## Park|165
park/del|Park verisini sil|#channel_id,key
park/list|Park verilerini listele|#channel_id,key
park/set|Park verisi kaydet|#channel_id,key,val
## Pass|180
pass/get|Geçiş kodu al|
pass/use|Geçiş kodunu kullan|pass_code
## Yetki|195
permission/channel|Kanal yetkisini getir|#channel_id,#user_id
permission/power|Grup gücünü getir|#group_id,#user_id
## Gönderi|210
post/add|Gönderi gönder|#channel_id,group_nick,channel_nick,code,text
post/bumote|Bumote ekle|#post_id,code
post/del|Gönderiyi sil|#post_id
post/get|Gönderiyi getir|#post_id
post/list|Gönderileri listele|#channel_id,group_nick,channel_nick,#after,#before
post/set|Gönderiyi düzenle|#post_id,#channel_id,code,text
## Arama|225
public/search|Kullanıcı/grup ara|text
public/usernickavailable|Kullanıcı adı müsait mi|nick
## Rol|240
role/add|Rol oluştur|#group_id,name,color,#power_group,#power_role,#power_channel,#power_post,#power_member,#power_room,#power_team,#power_mention
role/del|Rolü sil|#role_id
role/get|Rolü getir|#role_id
role/list|Rolleri listele|#group_id
role/set|Rolü düzenle|#role_id,name,color,#power_group,#power_role,#power_channel,#power_post,#power_member,#power_room,#power_team,#power_mention
role/sort|Rolleri sırala|#group_id,role_ids
## Takım|255
team/list|Takımları listele|#group_id
## Test|270
test/ip|IP adresini getir|
test/time|Sunucu saatini getir|
## Turbo|285
turbo/history/list|Turbo geçmişini getir|#limit,#offset
turbo/transfer|Turbo gönder|#user_id,#quantity,message
## Kullanıcı|300
user/2fa/get|2FA kodunu getir|
user/2fa/verify|2FA doğrula|code
user/auth|Giriş yap / kayıt ol|email,pass
user/block|Kullanıcıyı engelle|#user_id
user/blocked/users|Engellenenleri listele|
user/devices|Cihazlarımı getir|
user/friends|Arkadaşlarımı getir|
user/groups|Sahibi olduğum grupları getir|#owner_id
user/id|Kullanıcı ID'mi getir|
user/info|Kullanıcı bilgisi getir|#id,nick
user/lang/set|Dili ayarla|lang
user/list|Kullanıcıları listele|user_ids
user/login|Giriş yap|email,pass
user/logout|Çıkış yap|token,other
user/notification/info|Bildirim durumunu getir|
user/notification/set|Bildirim türlerini ayarla|#mention,#friendship,#news,#turbo,#message
user/pass|Kod ile geç|code
user/qr/get|QR girişi getir|private_key
user/qr/set|QR ile giriş yap|public_key
user/register|Kayıt ol|email,pass
user/register/verify|Kaydı doğrula|code
user/set/privacy|Gizliliği ayarla|#everyone_call,#everyone_message
user/set/profile|Profili ayarla|image,name,nick,about_me
user/set/slide|Slayt ayarla|#app_id
user/set/socials|Sosyal hesapları ayarla|social_instagram,social_x,social_youtube,social_tiktok,social_kick,social_twitch,social_github,social_steam,social_linkedin,social_website
user/unblock|Engeli kaldır|#user_id
user/waiting/list|Bekleyenleri listele|
`;
