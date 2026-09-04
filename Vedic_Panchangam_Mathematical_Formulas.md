# Vedic Panchangam & Astronomical Computation Formulas
## Mathematical Specification Document

This document provides the formal mathematical formulas, coordinate systems, and computational algorithms for the 18 core limbs of the Vedic Panchangam and Astrological Engine.

---

### 0. Fundamental Constants & Coordinate Frames

* **Precession (Ayanamsa, $A$):** 
  $$A = A_{\text{Lahiri}}(t) = 23^\circ 51' 11'' + 50.29'' \times (t - 2000.0)$$
* **Sayana to Nirayana Conversion:**
  $$\lambda_{\text{Nirayana}} = (\lambda_{\text{Sayana}} - A + 360^\circ) \pmod{360^\circ}$$
* **Obliquity of Ecliptic ($\epsilon$):** $\epsilon \approx 23.4392911^\circ - 0.0130042^\circ \times T$
* **Julian Day Number ($JD$):**
  $$JD = \lfloor 365.25(Y + 4716) \rfloor + \lfloor 30.6001(M + 1) \rfloor + D + \frac{UT}{24} + B - 1524.5$$

---

### 1. Sunrise ($T_{\text{rise}}$) & Sunset ($T_{\text{set}}$)

#### Astronomical Algorithm
1. **Sun's Declination ($\delta_{\odot}$):**
   $$\sin \delta_{\odot} = \sin \lambda_{\text{Sayana}} \cdot \sin \epsilon$$
2. **Apparent Zenith Distance ($z_0$):**
   $$z_0 = 90^\circ + 16' \text{ (semi-diameter)} + 34' \text{ (atmospheric refraction)} = 90^\circ 50' = 90.8333^\circ$$
3. **Local Hour Angle ($H_0$):**
   $$\cos H_0 = \frac{\cos z_0 - \sin \phi \cdot \sin \delta_{\odot}}{\cos \phi \cdot \cos \delta_{\odot}}$$
   *(Where $\phi$ is observer latitude. If $\cos H_0 > 1$ or $<-1$, polar day/night occurs).*
4. **Local Mean Time of Solar Transit ($T_{\text{noon}}$):**
   $$T_{\text{noon}} = 12:00:00 - \frac{\Delta \lambda}{15^\circ} - EoT$$
   *(Where $\Delta \lambda$ is longitude relative to time zone meridian, $EoT$ is Equation of Time).*
5. **Rise and Set Times:**
   $$T_{\text{rise}} = T_{\text{noon}} - \frac{H_0}{15^\circ}$$
   $$T_{\text{set}} = T_{\text{noon}} + \frac{H_0}{15^\circ}$$

#### Classical Surya Siddhanta (Ascensional Difference / *Cara*)
* **Equinoctial Shadow ($s$):** $s = 12 \tan \phi$ digits
* **Earth-Sine (*Kujya*, $k$):** $k = \frac{R \sin \delta_{\odot} \cdot s}{12}$
* **Diurnal Radius (*Dyujya*, $R_d$):** $R_d = \sqrt{R^2 - \sin^2 \delta_{\odot}}$
* **Sine of Ascensional Difference (*Carajya*, $\sin c$):** $\sin c = \frac{k \cdot R}{R_d}$
* **Day Length (*Dinamana*):**
  $$D = 30 \pm \frac{c \text{ (in respirations)}}{360} \quad \text{ghatis}$$

---

### 2. Moonrise ($T_{\text{moonrise}}$) & Moonset ($T_{\text{moonset}}$)

Because the Moon moves rapidly ($\approx 13.176^\circ/\text{day}$), its coordinates $\lambda_{\leftmoon}(t)$, $\beta_{\leftmoon}(t)$ vary continuously.

1. **Topocentric Zenith Distance ($z_{\leftmoon}$):**
   $$z_{\leftmoon} = 90^\circ + 34' \text{ (refraction)} + s_{\leftmoon} \text{ (semi-diameter } \approx 15.5') - \pi_{\leftmoon} \text{ (horizontal parallax } \approx 57')$$
   $$z_{\leftmoon} \approx 89^\circ 52.5' = 89.875^\circ$$
2. **Topocentric Altitude Equation:**
   $$h(t) = \arcsin\left(\sin \phi \sin \delta_{\leftmoon}(t) + \cos \phi \cos \delta_{\leftmoon}(t) \cos H_{\leftmoon}(t)\right) - (90^\circ - z_{\leftmoon}) = 0$$
3. **Iterative Approximation:**
   Given trial time $t_i$:
   $$\Delta t = \frac{-h(t_i)}{15^\circ \cos \delta_{\leftmoon}(t_i) \sin H_{\leftmoon}(t_i) - \frac{d\alpha_{\leftmoon}}{dt}}$$
   $$t_{i+1} = t_i + \Delta t \quad \text{until } |\Delta t| < 1 \text{ second}$$

---

### 3. Sun Rashi ($R_{\odot}$) & Moon Rashi ($R_{\leftmoon}$)

Dividing the $360^\circ$ sidereal zodiac into 12 equal signs of $30^\circ$ each:

#### Sun Rashi
$$R_{\odot} = \left\lfloor \frac{L_{\odot, \text{Nirayana}}}{30^\circ} \right\rfloor \in \{0, 1, \dots, 11\}$$
$$\text{Deg in Sign} = L_{\odot, \text{Nirayana}} \pmod{30^\circ}$$

#### Moon Rashi
$$R_{\leftmoon} = \left\lfloor \frac{L_{\leftmoon, \text{Nirayana}}}{30^\circ} \right\rfloor \in \{0, 1, \dots, 11\}$$
$$\text{Deg in Sign} = L_{\leftmoon, \text{Nirayana}} \pmod{30^\circ}$$

*Mapping: $0=\text{Mesha}, 1=\text{Vrishabha}, 2=\text{Mithuna}, 3=\text{Karka}, 4=\text{Simha}, 5=\text{Kanya}, 6=\text{Tula}, 7=\text{Vrischika}, 8=\text{Dhanus}, 9=\text{Makara}, 10=\text{Kumbha}, 11=\text{Meena}$.*

---

### 4. Ayanam (అయనం)

#### Nirayana / Sankranti System (Classical)
Based on Sun's ingress into Capricorn (*Makara Sankranti*) and Cancer (*Karka Sankranti*):
$$\text{Ayanam} = \begin{cases} 
\text{Uttarayanam} & \text{if } 270^\circ \le L_{\odot} < 360^\circ \text{ or } 0^\circ \le L_{\odot} < 90^\circ \\
\text{Dakshinayanam} & \text{if } 90^\circ \le L_{\odot} < 270^\circ 
\end{cases}$$

#### Sayana / Solstitial System
Based on physical turnaround of Sun's declination ($\delta_{\odot}$):
$$\text{Ayanam} = \begin{cases} 
\text{Uttarayanam} & \text{if } \frac{d\delta_{\odot}}{dt} > 0 \quad (\text{Winter Solstice to Summer Solstice}) \\
\text{Dakshinayanam} & \text{if } \frac{d\delta_{\odot}}{dt} < 0 \quad (\text{Summer Solstice to Winter Solstice})
\end{cases}$$

---

### 5. Rutu (ఋతువు — Season)

The Hindu astronomical calendar divides the solar year into six Rutus ($60^\circ$ solar transit each):

$$\text{Rutu Index} = \left\lfloor \frac{R_{\odot}}{2} \right\rfloor + 1 \in \{1, 2, 3, 4, 5, 6\}$$

| Index | Rutu Name | Nature | Signs Occupied ($R_{\odot}$) | Solar Span |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Vasanta Rutu** | Spring | $0, 1$ (Mesha, Vrishabha) | $0^\circ - 60^\circ$ |
| **2** | **Grishma Rutu** | Summer | $2, 3$ (Mithuna, Karkataka) | $60^\circ - 120^\circ$ |
| **3** | **Varsha Rutu** | Monsoon | $4, 5$ (Simha, Kanya) | $120^\circ - 180^\circ$ |
| **4** | **Sharad Rutu** | Autumn | $6, 7$ (Tula, Vrishchika) | $180^\circ - 240^\circ$ |
| **5** | **Hemanta Rutu** | Winter | $8, 9$ (Dhanus, Makara) | $240^\circ - 300^\circ$ |
| **6** | **Shishira Rutu** | Cool / Late Winter | $10, 11$ (Kumbha, Meena) | $300^\circ - 360^\circ$ |

---

### 6. Masam (మాసం — Lunar Month)

#### Lunar Month Naming (Amanta System)
A lunar synodic month runs from New Moon to New Moon. It is named after the solar sign in which the **initial conjunction (New Moon / Amavasya)** occurs:

$$\Delta L_{\odot, \leftmoon}(JD_{\text{new moon}}) = 0^\circ$$
$$R_{\text{amavasya}} = \left\lfloor \frac{L_{\odot}(JD_{\text{new moon}})}{30^\circ} \right\rfloor$$
$$\text{Lunar Month Index} = (R_{\text{amavasya}} + 1) \pmod{12}$$
*(Where $0=\text{Chaitra}, 1=\text{Vaishakha}, \dots, 11=\text{Phalguna}$).*

#### Intercalary Adjustments (Adhika & Kshaya)
* **Adhika Masam (Mala Masam):**
  If two consecutive New Moons occur within the **same zodiac sign** (no Sankranti occurs between them):
  $$\left\lfloor \frac{L_{\odot}(JD_{\text{NM}_1})}{30^\circ} \right\rfloor = \left\lfloor \frac{L_{\odot}(JD_{\text{NM}_2})}{30^\circ} \right\rfloor \implies \text{Adhika Masam}$$
* **Kshaya Masam (Lost Month):**
  If two solar Sankrantis occur within a single synodic month (very rare).

---

### 7. Paksham (పక్షం — Lunar Fortnight)

Determined by the geocentric angular separation between the Moon and Sun:

$$\Delta L = (L_{\leftmoon} - L_{\odot} + 360^\circ) \pmod{360^\circ}$$

$$\text{Paksham} = \begin{cases} 
\text{Shukla Paksham (Bright / Waxing)} & \text{if } 0^\circ \le \Delta L < 180^\circ \\
\text{Krishna Paksham (Dark / Waning)} & \text{if } 180^\circ \le \Delta L < 360^\circ
\end{cases}$$

---

### 8. Tithi (తిథి) & Ending Time

Each Tithi measures exactly $12^\circ$ of longitudinal elongation between Moon and Sun ($360^\circ / 30 = 12^\circ$).

#### Tithi Number
$$\text{Tithi Index} = \left\lfloor \frac{\Delta L}{12^\circ} \right\rfloor \in \{0, 1, \dots, 29\}$$
$$\text{Tithi Number} = \text{Tithi Index} + 1$$
*(Index $0-14$: Shukla Padyami to Purnima; Index $15-29$: Krishna Padyami to Amavasya).*

#### Exact Ending Time Calculation
1. **Remaining Angular Distance ($RD$):**
   $$RD = 12^\circ - (\Delta L \pmod{12^\circ})$$
2. **Relative Angular Velocity ($v_{\text{rel}}$):**
   $$v_{\text{rel}} = \frac{dL_{\leftmoon}}{dt} - \frac{dL_{\odot}}{dt} \quad (\text{deg/day})$$
3. **Time to End ($\Delta T$ in hours):**
   $$\Delta T = \frac{RD}{v_{\text{rel}}} \times 24$$
   $$JD_{\text{end}} = JD_0 + \frac{\Delta T}{24}$$

---

### 9. Vasara (వాసరము — Weekday)

Counted from local sunrise to the next sunrise using Ahargana ($JD_{\text{sunrise}}$):

$$\text{Vara Index} = \left(\left\lfloor JD_{\text{sunrise}} + 0.5 \right\rfloor + 1\right) \pmod 7$$

| Index | Sanskrit Name | Telugu Name | English | Rasi Lord |
| :---: | :--- | :--- | :--- | :--- |
| **0** | **Bhanuvasara** | ఆదివారం | Sunday | Surya (Sun) |
| **1** | **Somavasara** | సోమవారం | Monday | Chandra (Moon) |
| **2** | **Bhaumavasara** | మంగళవారం | Tuesday | Mangala (Mars) |
| **3** | **Saumyavasara** | బుధవారం | Wednesday | Budha (Mercury) |
| **4** | **Guruvasara** | గురువారం | Thursday | Brihaspati (Jupiter) |
| **5** | **Bhriguvasara** | శుక్రవారం | Friday | Shukra (Venus) |
| **6** | **Sthiravasara** | శనివారం | Saturday | Shani (Saturn) |

---

### 10. Nakshatram (నక్షత్రం) & Ending Time

The $360^\circ$ sidereal ecliptic is partitioned into 27 equal stellar mansions of $13^\circ 20' = \frac{40^\circ}{3} = 13.333333^\circ$ (800 arcminutes) each.

#### Nakshatra Index
$$\text{Nakshatra Index} = \left\lfloor \frac{L_{\leftmoon, \text{Nirayana}}}{13^\circ 20'} \right\rfloor \in \{0, 1, \dots, 26\}$$
$$\text{Nakshatra Number} = \text{Nakshatra Index} + 1$$

#### Nakshatra Padam (Pada / Quarter)
Each Nakshatra is subdivided into 4 quarters of $3^\circ 20' = 3.333333^\circ$ (200 arcminutes):
$$\text{Pada Number} = \left\lfloor \frac{L_{\leftmoon} \pmod{13^\circ 20'}}{3^\circ 20'} \right\rfloor + 1 \in \{1, 2, 3, 4\}$$

#### Ending Time Calculation
$$\text{Arc Remaining} = 13^\circ 20' - (L_{\leftmoon} \pmod{13^\circ 20'})$$
$$\Delta T_{\text{end}} = \frac{\text{Arc Remaining}}{v_{\leftmoon}} \times 24 \text{ hours}$$

---

### 11. Yogam (యోగం) & Ending Time

Yogam is derived from the **sum** of the Nirayana longitudes of the Sun and Moon ($360^\circ / 27 = 13^\circ 20'$ per Yoga):

$$S = (L_{\leftmoon, \text{Nirayana}} + L_{\odot, \text{Nirayana}}) \pmod{360^\circ}$$
$$\text{Yoga Index} = \left\lfloor \frac{S}{13^\circ 20'} \right\rfloor \in \{0, 1, \dots, 26\}$$
$$\text{Yoga Number} = \text{Yoga Index} + 1$$

#### Ending Time Calculation
Because both bodies advance the sum, the combined velocity is additive:
$$v_{\text{combined}} = \frac{dL_{\leftmoon}}{dt} + \frac{dL_{\odot}}{dt}$$
$$\Delta T_{\text{end}} = \frac{13^\circ 20' - (S \pmod{13^\circ 20'})}{v_{\text{combined}}} \times 24 \text{ hours}$$

---

### 12. Karanam (కరణం) & Ending Time

A Karanam equals **half of a Tithi** ($6^\circ = 360 arcminutes$). There are 60 Karanams in a lunar month.

$$\text{Karana Index} = \left\lfloor \frac{\Delta L}{6^\circ} \right\rfloor \in \{0, 1, \dots, 59\}$$

#### Name Mapping Algorithm
* **Fixed Karanams (*Sthira*, occurs once per month):**
  * Index $0$ (1st half of Shukla Padyami): **Kinstughna**
  * Index $57$ (2nd half of Krishna Chaturdashi): **Shakuni**
  * Index $58$ (1st half of Amavasya): **Chatushpada**
  * Index $59$ (2nd half of Amavasya): **Naga**
* **Movable Karanams (*Chara*, 7 repeating cycles across indices 1 to 56):**
  $$\text{Chara Index} = ((\text{Karana Index} - 1) \pmod 7) + 1$$
  *(1: Bava, 2: Balava, 3: Kaulava, 4: Taitila, 5: Garaja, 6: Vanija, 7: Vishti/Bhadra).*

#### Ending Time Calculation
$$\Delta T_{\text{end}} = \frac{6^\circ - (\Delta L \pmod{6^\circ})}{v_{\leftmoon} - v_{\odot}} \times 24 \text{ hours}$$

---

### 13. Maudhyam (మౌఢ్యమ్ — Planetary Combustion / Astangata)

Occurs when an exterior or interior planet approaches too close to the Sun in celestial longitude.

#### Angular Separation
$$\Delta \theta_{\text{planet}} = \min\left(|L_{\text{planet}} - L_{\odot}|, \, 360^\circ - |L_{\text{planet}} - L_{\odot}|\right)$$

#### Combustion Condition
$$\Delta \theta_{\text{planet}} \le \text{Orb}_{\text{limit}}(\text{Planet}, \text{Motion})$$

#### Classical Surya Siddhanta Combustion Orbs:

| Planet ($P$) | Direct Motion Orb ($\Omega_D$) | Retrograde (*Vakra*) Orb ($\Omega_R$) |
| :--- | :---: | :---: |
| **Guru (Jupiter)** | $11^\circ$ | $11^\circ$ |
| **Shukra (Venus)** | $10^\circ$ | $8^\circ$ |
| **Budha (Mercury)** | $14^\circ$ | $12^\circ$ |
| **Kuja (Mars)** | $17^\circ$ | $17^\circ$ |
| **Shani (Saturn)** | $15^\circ$ | $15^\circ$ |

#### Exact End Boundary Solution
Solved by continuous root-finding:
$$f(t) = \Delta \theta_P(t) - \text{Orb}_{\text{limit}}(P, t) = 0$$

---

### 14. Day & Night Choghadiya (చోఘడియాలు)

#### Time Partitioning
* **Day Duration ($D_{\text{day}}$):** $D_{\text{day}} = T_{\text{sunset}} - T_{\text{sunrise}}$
* **Day Portion ($S_{\text{day}}$):** $S_{\text{day}} = \frac{D_{\text{day}}}{8}$
* **Night Duration ($D_{\text{night}}$):** $D_{\text{night}} = T_{\text{sunrise(next)}} - T_{\text{sunset}}$
* **Night Portion ($S_{\text{night}}$):** $S_{\text{night}} = \frac{D_{\text{night}}}{8}$

#### Sequence Generator by Weekday
The 7 Choghadiya rulers rotate cyclically based on the planetary hour ruler (*Hora*):
1. **Udveg** (Sun / Inauspicious)
2. **Char** (Venus / Neutral)
3. **Labh** (Mercury / Auspicious)
4. **Amrit** (Moon / Most Auspicious)
5. **Kaal** (Saturn / Inauspicious)
6. **Shubh** (Jupiter / Auspicious)
7. **Rog** (Mars / Inauspicious)

The $k$-th day slot ($k = 0 \dots 7$) starts at $T_{\text{sunrise}} + k \cdot S_{\text{day}}$.  
The starting slot is determined by the day lord:
* **Sunday Day 1st:** Udveg $\rightarrow$ Char $\rightarrow$ Labh $\rightarrow$ Amrit $\rightarrow$ Kaal $\rightarrow$ Shubh $\rightarrow$ Rog $\rightarrow$ Udveg
* **Monday Day 1st:** Amrit $\rightarrow$ Kaal $\rightarrow$ Shubh $\rightarrow$ Rog $\rightarrow$ Udveg $\rightarrow$ Char $\rightarrow$ Labh $\rightarrow$ Amrit
* **Tuesday Day 1st:** Rog $\rightarrow$ Udveg $\rightarrow$ Char $\rightarrow$ Labh $\rightarrow$ Amrit $\rightarrow$ Kaal $\rightarrow$ Shubh $\rightarrow$ Rog
* **Wednesday Day 1st:** Labh $\rightarrow$ Amrit $\rightarrow$ Kaal $\rightarrow$ Shubh $\rightarrow$ Rog $\rightarrow$ Udveg $\rightarrow$ Char $\rightarrow$ Labh
* **Thursday Day 1st:** Shubh $\rightarrow$ Rog $\rightarrow$ Udveg $\rightarrow$ Char $\rightarrow$ Labh $\rightarrow$ Amrit $\rightarrow$ Kaal $\rightarrow$ Shubh
* **Friday Day 1st:** Char $\rightarrow$ Labh $\rightarrow$ Amrit $\rightarrow$ Kaal $\rightarrow$ Shubh $\rightarrow$ Rog $\rightarrow$ Udveg $\rightarrow$ Char
* **Saturday Day 1st:** Kaal $\rightarrow$ Shubh $\rightarrow$ Rog $\rightarrow$ Udveg $\rightarrow$ Char $\rightarrow$ Labh $\rightarrow$ Amrit $\rightarrow$ Kaal

---

### 15. Lagnaantakalu (లగ్నాంతకాలు — Ascendant Spashta & Sign Endings)

The Ascendant (*Lagna*, $\lambda_{\text{Asc}}$) is the eastern intersection of the local horizon and the ecliptic.

#### 1. Local Sidereal Time ($\theta_{\text{LST}}$)
$$\theta_{\text{LST}} = \alpha_{\odot} + H_{\odot} = \text{RAMC}$$

#### 2. Ascendant Longitude ($\lambda_{\text{Asc}}$)
$$\tan \lambda_{\text{Asc}} = \frac{-\cos \theta_{\text{LST}}}{\sin \theta_{\text{LST}} \cos \epsilon + \tan \phi \sin \epsilon}$$
$$L_{\text{Asc, Nirayana}} = (\lambda_{\text{Asc, Sayana}} - A + 360^\circ) \pmod{360^\circ}$$

#### 3. Lagna Boundary Ending Time ($T_{\text{end}}$)
For active Lagna $R_{\text{Asc}} = \lfloor L_{\text{Asc}} / 30^\circ \rfloor$, the next boundary is:
$$\lambda_{\text{target}} = (R_{\text{Asc}} + 1) \times 30^\circ$$
The clock time $T_{\text{end}}$ when $\lambda_{\text{Asc}}(T_{\text{end}}) = \lambda_{\text{target}}$ is calculated by:
$$H_{\odot}(T_{\text{end}}) = \theta_{\text{LST}}(\lambda_{\text{target}}) - \alpha_{\odot}$$
$$T_{\text{end}} = T_{\text{noon}} + \frac{H_{\odot}(T_{\text{end}})}{15^\circ}$$

---

### Summary Checklist of All 18 Formulations

| # | Element | Input Variables | Primary Mathematical Operation |
| :---: | :--- | :--- | :--- |
| **1** | **Sunrise** | $\phi, \delta_{\odot}, \Delta \lambda, EoT$ | Spherical Hour Angle $\cos H_0 = \frac{\cos 90.833^\circ - \sin \phi \sin \delta}{\cos \phi \cos \delta}$ |
| **2** | **Sunset** | $\phi, \delta_{\odot}, \Delta \lambda, EoT$ | $T_{\text{set}} = T_{\text{noon}} + H_0 / 15^\circ$ |
| **3** | **Moonrise** | $\phi, \lambda_{\leftmoon}, \beta_{\leftmoon}, \pi_{\leftmoon}$ | Iterative root-finding on apparent horizon intercept altitude |
| **4** | **Moonset** | $\phi, \lambda_{\leftmoon}, \beta_{\leftmoon}, \pi_{\leftmoon}$ | Iterative root-finding on descending horizon intercept altitude |
| **5** | **Sun Rashi** | $L_{\odot, \text{Nirayana}}$ | $\lfloor L_{\odot} / 30^\circ \rfloor$ |
| **6** | **Moon Rashi** | $L_{\leftmoon, \text{Nirayana}}$ | $\lfloor L_{\leftmoon} / 30^\circ \rfloor$ |
| **7** | **Ayanam** | $L_{\odot, \text{Nirayana}}$ | Quadrant test ($270^\circ-90^\circ$ Uttarayanam, $90^\circ-270^\circ$ Dakshinayanam) |
| **8** | **Rutu** | $R_{\odot}$ | Season index $\lfloor R_{\odot} / 2 \rfloor + 1$ |
| **9** | **Masam** | $L_{\odot}(JD_{\text{new moon}})$ | $(R_{\text{amavasya}} + 1) \pmod{12}$ |
| **10** | **Paksham** | $L_{\leftmoon} - L_{\odot}$ | Range partition ($[0^\circ, 180^\circ)$ Shukla, $[180^\circ, 360^\circ)$ Krishna) |
| **11** | **Tithi** | $\Delta L = L_{\leftmoon} - L_{\odot}$ | $\lfloor \Delta L / 12^\circ \rfloor + 1$, time $\frac{RD}{v_{\text{rel}}} \times 24$ |
| **12** | **Vasara** | $JD_{\text{sunrise}}$ | $(\lfloor JD_{\text{sunrise}} + 0.5 \rfloor + 1) \pmod 7$ |
| **13** | **Nakshatram** | $L_{\leftmoon, \text{Nirayana}}$ | $\lfloor L_{\leftmoon} / 13^\circ 20' \rfloor + 1$, Pada $\lfloor (L_{\leftmoon} \pmod{13^\circ 20'}) / 3^\circ 20' \rfloor + 1$ |
| **14** | **Yogam** | $L_{\leftmoon} + L_{\odot}$ | $\lfloor (L_{\leftmoon} + L_{\odot}) / 13^\circ 20' \rfloor + 1$ |
| **15** | **Karanam** | $\Delta L = L_{\leftmoon} - L_{\odot}$ | $\lfloor \Delta L / 6^\circ \rfloor + 1$ |
| **16** | **Maudhyam** | $L_P, L_{\odot}, \text{Orb}(P)$ | $\|L_P - L_{\odot}\| \le \text{Orb}_{\text{limit}}(P, \text{motion})$ |
| **17** | **Choghadiya** | $D_{\text{day}}, D_{\text{night}}, \text{Vara}$ | $\frac{D}{8}$ intervals sequenced by planetary day lord |
| **18** | **Lagnaantakalu** | $\theta_{\text{LST}}, \phi, \epsilon$ | Ecliptic oblique ascension boundary crossing times $\tan \lambda_{\text{Asc}}$ |
