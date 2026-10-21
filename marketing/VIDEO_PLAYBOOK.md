
## 畫面手法（參考 Threads @thaisong06 的 Opus 動態影片技巧）

來源：https://www.threads.com/@thaisong06/post/DefmqwyD8R-

請 Opus 直接產出**純 JavaScript 動畫**，先講清楚長度、比例、主題，再加一句風格指令：

| 技巧 | 關鍵句 | 在 MEOW LINE 怎麼用 |
|---|---|---|
| 文字動效 | 以文字作為畫面主體，文字的運動呼應其含義，跟隨聲音節奏出現、強調、轉場。 | 問句抖動彈出、「啵！」對齊消除音效 |
| 數據可視化 | 每個場景只講清一個核心概念，資訊跟隨講解逐步出現。 | 大字「連鎖 ×N」隨每波跳動；結尾對比剩幾隻 |
| 變速運鏡 | 場景之間加速推進，並留出穩定展示的時間。 | 放貓快轉、關鍵一步停下、連鎖時畫面震動 |
| 轉場接力 | 每次轉場，必須留下一個元素，變成下一幕的開始。 | 「全部消除」的綠圓擴散成片尾底色 |
| 動態拼貼 | 主體、背景、文字、裝飾拆成獨立圖層，用錯位、遮擋、縮放、視差做層次。 | 品牌形象片：貓、箱子、花園拆層 |

萬用提示詞：

> 製作一條 __ 秒、9:16 的純 JavaScript 動畫，主題是「__」。〔關鍵句〕。盤面數據使用 `data.js`（由 planningEngine 匯出），配色延續遊戲的奶油底、水藍棋盤、橘色強調，音效對齊落點與每一波消除。


## 40 種運鏡（參考 Threads @ella.ai.create.tw）

來源：https://www.threads.com/@ella.ai.create.tw/post/DenPynTgeTW
左移、右移以「鏡頭本身面對的方向」為準，跟畫面上看到的方向一致。

| 類別 | 運鏡（英文名：效果） |
|---|---|
| 基礎運鏡 | 水平搖攝（Pan：左右帶出場景）、垂直搖攝（Tilt：上下帶出視線）、變焦拉近（Zoom In：主角逐漸放大）、變焦拉遠（Zoom Out：畫面範圍變廣）、鏡頭前推（Dolly In：鏡頭真的向前走）、鏡頭後拉（Dolly Out：鏡頭真的向後退）、跟拍鏡頭（Tracking：跟著主角走）、環繞鏡頭（Orbit：繞著主角換角度） |
| 移動鏡頭 | 快速甩鏡（Whip Pan：甩向下一幕）、焦點轉移（Rack Focus：焦點從前景到後景）、搖臂升起（Crane Up：從低處升高看全景）、搖臂下降（Crane Down：從高處降到主角）、鏡頭左移／右移（Truck Left/Right：鏡頭平行移動）、機位上升／下降（Pedestal Up/Down：高度改變，角度不變） |
| 視角變化 | 推拉變焦（Dolly Zoom：主角不變、背景變形）、傾斜鏡頭（Dutch Tilt：畫面慢慢傾斜）、鏡頭翻轉（Camera Roll：繞中心旋轉）、第一視角衝刺（FPV Rush：像自己衝進畫面）、低角度跟拍（Low Angle：貼近地面追主角）、俯視移動（Overhead：從上方掠過場景）、向左／向右環繞（Arc Left/Right：沿弧線轉到側邊） |
| 跟拍方式 | 正面跟拍（Lead Shot：在主角前面邊退邊拍）、背面跟拍（Follow Shot）、側面跟拍（Side Track）、後退跟拍（Reverse Track：邊退邊保持距離）、高速掠過（Pass By：主角快速穿過鏡頭）、穿越前景（Push Through：穿過門框看見主角）、後拉揭露（Pull Back：拉遠才看見完整場景）、環繞升起（Orbit Rise：繞主角同時升高） |
| 動態轉場 | 遮擋切換（Occlusion：被遮住時換下一幕）、動作對位（Match Cut：同一動作接下一幕）、甩鏡切換（Whip Cut）、變焦切換（Zoom Cut：放大穿進下一幕）、前景擦鏡（Foreground：前方物件掃出新畫面）、主角遮擋切換（Subject Wipe：主角走過時切換）、上下甩鏡切換（Tilt Cut）、旋轉切換（Spin Cut：旋轉接到下一幕） |

MEOW LINE 可直接套用的：Zoom In 推到關鍵那一步、Rack Focus 從貓轉到號碼、Pull Back 拉遠揭露全部消除的盤面、Zoom Cut／Match Cut 接片尾。寫進提示詞時用英文名最不會被誤解。

## 運鏡禁忌

- 盤面消除畫面全程不震動、不傾斜（不用 Dutch Tilt／Camera Roll／Arc 擺角），也不要每波衝擊縮放。鏡頭只做平順的 Tracking、Zoom、Crane、Dolly，移動用 ease-in-out，不用甩鏡；否則會暈，也看不清是哪幾隻被消掉。
- 連鎖段要有運鏡變化，不能整段固定鏡頭，否則幾秒就不想看了。可以分段換手法：Tracking 平順跟拍 → Zoom In 推近跟拍 → Crane Up 拉高看全盤 → Dolly Zoom 推進最後一團。
