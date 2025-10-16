# دليل أوامر إدارة الأفلام

## 📋 نظرة عامة
يحتوي هذا المجلد على جميع أوامر إدارة الأفلام المتاحة في النظام. تم تطوير هذه الأوامر لتوفير مرونة كاملة في استيراد الأفلام من مصادر متعددة.

---

## 📂 الأوامر المتاحة

### 1. `import_popular_movies.py`
**الغرض**: استيراد الأفلام الشائعة من TMDB مع Wikipedia كبديل

**الاستخدام**:
```bash
python manage.py import_popular_movies --pages 5 --delay 0.5
```

**الخيارات**:
- `--pages`: عدد الصفحات المراد استيرادها (1-500)
- `--delay`: التأخير بين كل استيراد بالثواني (افتراضي: 1.0)
- `--force`: إعادة استيراد الأفلام الموجودة
- `--retry-failed`: إعادة المحاولة للأفلام الفاشلة

**أمثلة**:
```bash
# استيراد 5 صفحات
python manage.py import_popular_movies --pages 5

# استيراد مع تأخير أقل للسرعة
python manage.py import_popular_movies --pages 10 --delay 0.2

# إعادة استيراد الأفلام الموجودة
python manage.py import_popular_movies --pages 1 --force
```

---

### 2. `import_wikipedia_movies.py` ⭐ **جديد**
**الغرض**: استيراد الأفلام مباشرة من Wikipedia

**الاستخدام**:
```bash
python manage.py import_wikipedia_movies "اسم الفيلم الأول" "اسم الفيلم الثاني" --delay 1.0
```

**الخيارات**:
- `titles`: أسماء الأفلام (متعددة)
- `--delay`: التأخير بين كل استيراد بالثواني (افتراضي: 1.0)

**أمثلة**:
```bash
# استيراد فيلم واحد
python manage.py import_wikipedia_movies "The Shawshank Redemption"

# استيراد عدة أفلام
python manage.py import_wikipedia_movies "Inception" "Interstellar" "The Dark Knight"

# مع تأخير مخصص
python manage.py import_wikipedia_movies "Pulp Fiction" "Fight Club" --delay 0.5
```

---

### 3. `retry_failed_movies.py`
**الغرض**: إعادة المحاولة لاستيراد الأفلام التي فشلت

**الاستخدام**:
```bash
python manage.py retry_failed_movies --tmdb-ids "123,456,789" --delay 2.0
```

**الخيارات**:
- `--tmdb-ids`: معرفات TMDB (مفصولة بفواصل)
- `--pages`: إعادة المحاولة لصفحات محددة
- `--delay`: التأخير بين كل استيراد بالثواني (افتراضي: 1.0)
- `--force`: إعادة المحاولة حتى لو كان الفيلم موجود

**أمثلة**:
```bash
# إعادة المحاولة لأفلام محددة
python manage.py retry_failed_movies --tmdb-ids "278,238,424"

# إعادة المحاولة لصفحات
python manage.py retry_failed_movies --pages "1,3,5"
```

---

### 4. `delete_all_movies.py`
**الغرض**: مسح جميع الأفلام من قاعدة البيانات

**⚠️ تحذير**: هذا الأمر يمسح جميع البيانات بشكل نهائي!

**الاستخدام**:
```bash
python manage.py delete_all_movies --force
```

**الخيارات**:
- `--force`: تأكيد المسح (مطلوب)

**أمثلة**:
```bash
# مسح جميع الأفلام (استخدم بحذر!)
python manage.py delete_all_movies --force
```

---

## 🔄 سير العمل المقترح

### لاستيراد أولي شامل:
```bash
# 1. مسح البيانات القديمة (اختياري)
python manage.py delete_all_movies --force

# 2. استيراد من TMDB (مع Wikipedia fallback)
python manage.py import_popular_movies --pages 50 --delay 0.5

# 3. إضافة أفلام إضافية من Wikipedia
python manage.py import_wikipedia_movies "Classic Movie 1" "Classic Movie 2"
```

### للصيانة الدورية:
```bash
# إعادة المحاولة للأفلام الفاشلة
python manage.py retry_failed_movies --pages "1,2,3"

# إضافة أفلام محددة
python manage.py import_wikipedia_movies "New Movie Title"
```

---

## 📊 مصادر البيانات

### TMDB (The Movie Database)
- **الميزة**: بيانات شاملة ومحدثة
- **العيوب**: قد يفشل بسبب API limits أو timeout
- **الاستخدام**: للأفلام الحديثة والشائعة

### Wikipedia
- **الميزة**: موثوقة ومتوفرة دائماً
- **العيوب**: بيانات أقل تفصيلاً
- **الاستخدام**: كبديل أو للأفلام الكلاسيكية

---

## 🎯 نصائح للاستخدام الأمثل

### 1. **التأخير المناسب**:
- استخدم تأخير 0.5-1.0 ثانية لـ TMDB
- استخدم تأخير 1.0+ ثانية لـ Wikipedia

### 2. **إدارة الأخطاء**:
- استخدم `retry_failed_movies` للأفلام التي فشلت
- تحقق من السجلات (logs) لمعرفة سبب الفشل

### 3. **الأداء**:
- استورد كميات كبيرة في أوقات غير مزدحمة
- راقب استخدام API لتجنب الحظر

### 4. **النسخ الاحتياطي**:
- خذ نسخة احتياطية قبل استخدام `delete_all_movies`
- تحقق من البيانات بعد كل عملية استيراد كبيرة

---

## 📈 مراقبة الأداء

### فحص عدد الأفلام:
```bash
python manage.py shell -c "from movies.models import Movie; print(f'إجمالي الأفلام: {Movie.objects.count()}')"
```

### فحص مصادر الأفلام:
```bash
python manage.py shell -c "
from movies.models import Movie
tmdb_count = Movie.objects.exclude(tmdb_id=None).count()
wiki_count = Movie.objects.filter(tmdb_id=None).count()
print(f'TMDB: {tmdb_count} أفلام')
print(f'Wikipedia: {wiki_count} أفلام')
"
```

### فحص الأفلام الأخيرة:
```bash
python manage.py shell -c "
from movies.models import Movie
recent = Movie.objects.order_by('-created_at')[:5]
for m in recent:
    source = 'Wikipedia' if m.tmdb_id is None else 'TMDB'
    print(f'{m.title} - {source}')
"
```

---

## 🔧 استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### 1. **خطأ في TMDB API**:
```
الحل: سيتم استخدام Wikipedia تلقائياً كبديل
```

#### 2. **خطأ في Wikipedia**:
```
الحل: تحقق من اسم الفيلم أو جرب اسماً بديلاً
```

#### 3. **بطء الاستيراد**:
```
الحل: زد التأخير أو قلل عدد الصفحات في المرة الواحدة
```

#### 4. **أفلام مكررة**:
```
الحل: استخدم --force لإعادة الكتابة أو تحقق من البيانات الموجودة
```

---

## 📝 السجلات (Logs)

جميع الأوامر تسجل عملياتها في السجلات. لمراقبة التقدم:

```bash
# مراقبة السجلات أثناء الاستيراد
tail -f logs/django.log

# أو في الطرفية
python manage.py import_popular_movies --pages 1 2>&1 | tee import_log.txt
```

---

## 🎯 الخلاصة

تم تطوير نظام الأوامر ليكون:
- **مرن**: دعم مصادر متعددة
- **موثوق**: معالجة أخطاء متقدمة
- **سهل الاستخدام**: أوامر واضحة مع أمثلة
- **قابل للمراقبة**: سجلات مفصلة وإحصائيات

استخدم هذا الدليل كمرجع لجميع عمليات إدارة الأفلام! 🚀