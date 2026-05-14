# TaCZ アタッチメント対応表

対象ファイル: `tacz-1.20.1-1.1.8-release.jar`

この一覧は、デフォルト銃パック内の `data/tacz/tacz_tags/attachments/allow_attachments/*.json` と、そこから参照される `tacz_tags/attachments/*.json` を展開して作成したものです。別の銃パックを入れている場合や、デフォルトパックを編集している場合は内容が変わります。

銃定義: 54種類（ガンスミステーブルの銃レシピ: 53種類） / アタッチメント定義: 99種類（アタッチメントレシピ: 95種類）

## 読み方

- 各銃ごとに、装着可能なアタッチメントを種類別にまとめています。
- `なし` は、その種類のアタッチメントがデフォルト定義上は装着できないことを示します。
- `tacz:...` は内部IDです。ゲーム内表示名が似ているアタッチメントを区別したい時に使います。
- 弾薬MODは内部的には拡張マガジン系スロットですが、見やすさのため別項目に分けています。
- `V` キーのズームが効くのは、スコープ / サイトを付けてADSしている時です。

## 銃別対応表

### マシンガン

#### M249 軽機関銃 (`tacz:m249`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### RPK (`tacz:rpk`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- ストック: 規格仕様軽量ストック (`tacz:oem_stock_light`)、規格仕様重量ストック (`tacz:oem_stock_heavy`)、規格仕様戦術ストック (`tacz:oem_stock_tactical`)、AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### M134 ミニガン (`tacz:minigun`)

- 装着可能アタッチメント: なし

#### FN EVOLYS 軽機関銃 (`tacz:fn_evolys`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

### ピストル

#### Glock 17 (`tacz:glock_17`)
- スコープ / サイト: Aimpoint ACRO P-1 サイト (`tacz:sight_acro_pistol`)、DeltaPoint サイト (`tacz:sight_deltapoint_pistol`)、FastFire サイト (`tacz:sight_fastfire_pistol`)、PK06 (`tacz:sight_pk06_pistol`)、RMR ミニドットサイト (`tacz:sight_rmr_dot`)、SRO ミニ ドットサイト (`tacz:sight_sro_dot`)
- マズル / バヨネット: Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### Deagle 50 (`tacz:deagle`)
- スコープ / サイト: T1 ドットサイト (`tacz:sight_t1`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### CZ 75 (`tacz:cz75`)
- スコープ / サイト: Aimpoint ACRO P-1 サイト (`tacz:sight_acro_pistol`)、DeltaPoint サイト (`tacz:sight_deltapoint_pistol`)、FastFire サイト (`tacz:sight_fastfire_pistol`)、PK06 (`tacz:sight_pk06_pistol`)、RMR ミニドットサイト (`tacz:sight_rmr_dot`)、SRO ミニ ドットサイト (`tacz:sight_sro_dot`)
- マズル / バヨネット: Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### Golden Deagle .357 (`tacz:deagle_golden`)
- スコープ / サイト: T1 ドットサイト (`tacz:sight_t1`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Golden Deagle.357マグナム ロングバレル (`tacz:deagle_golden_long_barrel`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### P320 (`tacz:p320`)
- スコープ / サイト: Aimpoint ACRO P-1 サイト (`tacz:sight_acro_pistol`)、DeltaPoint サイト (`tacz:sight_deltapoint_pistol`)、FastFire サイト (`tacz:sight_fastfire_pistol`)、PK06 (`tacz:sight_pk06_pistol`)、RMR ミニドットサイト (`tacz:sight_rmr_dot`)、SRO ミニ ドットサイト (`tacz:sight_sro_dot`)
- マズル / バヨネット: Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### M1911 (`tacz:m1911`)
- マズル / バヨネット: Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### B93R (`tacz:b93r`)
- スコープ / サイト: Aimpoint ACRO P-1 サイト (`tacz:sight_acro_pistol`)、DeltaPoint サイト (`tacz:sight_deltapoint_pistol`)、FastFire サイト (`tacz:sight_fastfire_pistol`)、PK06 (`tacz:sight_pk06_pistol`)、RMR ミニドットサイト (`tacz:sight_rmr_dot`)、SRO ミニ ドットサイト (`tacz:sight_sro_dot`)
- マズル / バヨネット: Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### Timeless .50 Z-Type (`tacz:timeless50`)
- スコープ / サイト: Aimpoint ACRO P-1 サイト (`tacz:sight_acro_pistol`)、DeltaPoint サイト (`tacz:sight_deltapoint_pistol`)、FastFire サイト (`tacz:sight_fastfire_pistol`)、PK06 (`tacz:sight_pk06_pistol`)、RMR ミニドットサイト (`tacz:sight_rmr_dot`)、SRO ミニ ドットサイト (`tacz:sight_sro_dot`)
- マズル / バヨネット: Timeless .50口径マズルブレーキ (`tacz:muzzle_brake_timeless50`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### .22 Modle 943 (`tacz:taurus943`)

- 装着可能アタッチメント: なし

#### .357 Rhino (`tacz:rhino357`)
- スコープ / サイト: Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### .30-06 Lonetrail (`tacz:lonetrail`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### MK23 SOCOM (`tacz:hk_mk23`)
- スコープ / サイト: Aimpoint ACRO P-1 サイト (`tacz:sight_acro_pistol`)、DeltaPoint サイト (`tacz:sight_deltapoint_pistol`)、FastFire サイト (`tacz:sight_fastfire_pistol`)、PK06 (`tacz:sight_pk06_pistol`)、RMR ミニドットサイト (`tacz:sight_rmr_dot`)、SRO ミニ ドットサイト (`tacz:sight_sro_dot`)
- マズル / バヨネット: Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)、PEQ6 ILLM (`tacz:laser_peq6`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### Taurus "Raging Hunter" (`tacz:taurus500`)
- スコープ / サイト: HAMR 3x スコープ (`tacz:scope_hamr`)、T1 ドットサイト (`tacz:sight_t1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、Contender 4x スコープ (`tacz:scope_contender`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### M9A4 (`tacz:m9a4`)
- スコープ / サイト: Aimpoint ACRO P-1 サイト (`tacz:sight_acro_pistol`)、DeltaPoint サイト (`tacz:sight_deltapoint_pistol`)、FastFire サイト (`tacz:sight_fastfire_pistol`)、PK06 (`tacz:sight_pk06_pistol`)、RMR ミニドットサイト (`tacz:sight_rmr_dot`)、SRO ミニ ドットサイト (`tacz:sight_sro_dot`)
- マズル / バヨネット: Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

### ライフル

#### AK47 (`tacz:ak47`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)
- マズル / バヨネット: 6H3 バヨネット (`tacz:bayonet_6h3`)、Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- ストック: 規格仕様軽量ストック (`tacz:oem_stock_light`)、規格仕様重量ストック (`tacz:oem_stock_heavy`)、規格仕様戦術ストック (`tacz:oem_stock_tactical`)、AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### M4A1 カービン (`tacz:m4a1`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、M9バヨネット (`tacz:bayonet_m9`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)、Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### HK G3 バトルライフル (`tacz:hk_g3`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: 規格仕様軽量ストック (`tacz:oem_stock_light`)、規格仕様重量ストック (`tacz:oem_stock_heavy`)、規格仕様戦術ストック (`tacz:oem_stock_tactical`)、AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)、Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### SKS タクティカルライフル (`tacz:sks_tactical`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### SCAR-H バトルライフル (`tacz:scar_h`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)、Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### SCAR-L アサルトライフル (`tacz:scar_l`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)、Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### M16A1 サービスライフル (`tacz:m16a1`)
- スコープ / サイト: Retro 3x スコープ (`tacz:scope_retro_2x`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、M9バヨネット (`tacz:bayonet_m9`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### M16A4 サービスライフル (`tacz:m16a4`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、M9バヨネット (`tacz:bayonet_m9`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)、Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### HK-416A5 (`tacz:hk416d`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)、Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### AUG (`tacz:aug`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、AUG組み込みスコープ (`tacz:scope_aug_default`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、M9バヨネット (`tacz:bayonet_m9`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### Mk14 EBR (`tacz:mk14`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)、Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### 81-1式自動歩槍 (`tacz:type_81`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### 95式自動歩槍 - "Longbow" (`tacz:qbz_95`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### G36K (`tacz:g36k`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)、Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### SPR-15 HB "サジタリウス" (`tacz:spr15hb`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### 191型自動歩槍 (`tacz:qbz_191`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)、Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### FN FAL バトルライフル (`tacz:fn_fal`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- レーザー: laser_peq15 (`tacz:laser_peq15`)、LoPro タクティカルレーザー (`tacz:laser_lopro`)、Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

### 重火器

#### M320 グレネードランチャー (`tacz:m320`)

- 装着可能アタッチメント: なし

#### RPG-7 (`tacz:rpg7`)

- 装着可能アタッチメント: なし

### ショットガン

#### M870 (`tacz:m870`)
- マズル / バヨネット: 12ゲージ サイレンサー (`tacz:muzzle_silencer_sg`)、ショットガン用チョーク (`tacz:muzzle_choke_sg`)、マスティフ ショットガン用マズルブレーキ (`tacz:muzzle_brake_mastiff_sg`)
- 拡張マガジン: ショットシェル用拡張マガジン (`tacz:shotgun_extended_mag_3`)、ショットシェル用拡張マガジン (`tacz:shotgun_extended_mag_2`)、ショットシェル用拡張マガジン (`tacz:shotgun_extended_mag_1`)
- 弾薬MOD: ショットガン用スラグ弾 (`tacz:ammo_mod_slug`)、ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)
- 未分類: `tacz:muzzle_duckbill_sg`

#### AA-12 ショットガン (`tacz:aa12`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)
- マズル / バヨネット: 12ゲージ サイレンサー (`tacz:muzzle_silencer_sg`)、ショットガン用チョーク (`tacz:muzzle_choke_sg`)、マスティフ ショットガン用マズルブレーキ (`tacz:muzzle_brake_mastiff_sg`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- 拡張マガジン: 大口径弾薬用拡張マガジン (`tacz:extended_mag_1`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_2`)、大口径弾薬用拡張マガジン (`tacz:extended_mag_3`)
- 弾薬MOD: ショットガン用スラグ弾 (`tacz:ammo_mod_slug`)、ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)
- 未分類: `tacz:muzzle_duckbill_sg`

#### SPAS-12 特殊ショットガン (`tacz:spas_12`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)
- マズル / バヨネット: 12ゲージ サイレンサー (`tacz:muzzle_silencer_sg`)、ショットガン用チョーク (`tacz:muzzle_choke_sg`)、マスティフ ショットガン用マズルブレーキ (`tacz:muzzle_brake_mastiff_sg`)
- ストック: AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)、Franchi ヘビーストック (`tacz:stock_heavy_spas_12`)、Franchi タクティカルストック (`tacz:stock_tactical_spas_12`)
- 拡張マガジン: ショットシェル用拡張マガジン (`tacz:shotgun_extended_mag_3`)、ショットシェル用拡張マガジン (`tacz:shotgun_extended_mag_2`)、ショットシェル用拡張マガジン (`tacz:shotgun_extended_mag_1`)
- 弾薬MOD: ショットガン用スラグ弾 (`tacz:ammo_mod_slug`)、ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)
- 未分類: `tacz:muzzle_duckbill_sg`

#### M1014 バトルショットガン (`tacz:m1014`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)
- マズル / バヨネット: 12ゲージ サイレンサー (`tacz:muzzle_silencer_sg`)、ショットガン用チョーク (`tacz:muzzle_choke_sg`)、マスティフ ショットガン用マズルブレーキ (`tacz:muzzle_brake_mastiff_sg`)
- 拡張マガジン: ショットシェル用拡張マガジン (`tacz:shotgun_extended_mag_3`)、ショットシェル用拡張マガジン (`tacz:shotgun_extended_mag_2`)、ショットシェル用拡張マガジン (`tacz:shotgun_extended_mag_1`)
- 弾薬MOD: ショットガン用スラグ弾 (`tacz:ammo_mod_slug`)、ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)
- 未分類: `tacz:muzzle_duckbill_sg`

#### DB-4 Ursus (`tacz:db_long`)
- 弾薬MOD: ショットガン用スラグ弾 (`tacz:ammo_mod_slug`)、ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### DB-2 Durin (`tacz:db_short`)
- ストック: 規格仕様戦術ストック (`tacz:oem_stock_tactical`)
- 弾薬MOD: ショットガン用スラグ弾 (`tacz:ammo_mod_slug`)、ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

### サブマシンガン

#### HK-MP5A5 (`tacz:hk_mp5a5`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- ストック: 規格仕様軽量ストック (`tacz:oem_stock_light`)、規格仕様重量ストック (`tacz:oem_stock_heavy`)、規格仕様戦術ストック (`tacz:oem_stock_tactical`)、AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### UZI (`tacz:uzi`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### Vector (`tacz:vector45`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)
- ストック: 規格仕様重量ストック (`tacz:oem_stock_heavy`)、規格仕様戦術ストック (`tacz:oem_stock_tactical`)、AK-12 標準ストック (`tacz:stock_ak12`)、Carbon Bone C5 ストック (`tacz:stock_carbon_bone_c5`)、CMMG Ripstock ストック (`tacz:stock_ripstock`)、HK スリムラインストック (`tacz:stock_hk_slim_line`)、M4SSストック (`tacz:stock_m4ss`)、Magpul CTR ストック (`tacz:stock_tactical_ar`)、Magpul MOE ストック (`tacz:stock_moe`)、Militech B5 ストック (`tacz:stock_militech_b5`)、SBA3 ストック (`tacz:stock_sba3`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### UMP-45 サブマシンガン (`tacz:ump45`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- グリップ: RK-6 グリップ (`tacz:grip_rk6`)、SI グリップ (`tacz:grip_cobra`)、Talon AFG1 ハンドストップ (`tacz:grip_magpul_afg_2`)、Koch レンジャーヘビーグリップ (`tacz:grip_vertical_ranger`)、Nagoma ミリタリー標準グリップ (`tacz:grip_vertical_military`)、P-2 グリップ (`tacz:grip_osovets_black`)、RK-0 グリップ (`tacz:grip_rk0`)、RK-1 B25U グリップ (`tacz:grip_rk1_b25u`)、SE-5 エクスプレス・フォアグリップ (`tacz:grip_se_5`)、Talon SG2 グリップ (`tacz:grip_vertical_talon`)、TD グリップ (`tacz:grip_td`)、Hera Arms CQR グリップ (`tacz:grip_cqr`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 拡張マガジン: 小口径弾薬用拡張マガジン (`tacz:light_extended_mag_3`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_2`)、小口径弾薬用拡張マガジン (`tacz:light_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### P90 PDW (`tacz:p90`)
- スコープ / サイト: Aimpoint ACRO P-1 サイト (`tacz:sight_acro_pistol`)、DeltaPoint サイト (`tacz:sight_deltapoint_pistol`)、FastFire サイト (`tacz:sight_fastfire_pistol`)、PK06 (`tacz:sight_pk06_pistol`)、RMR ミニドットサイト (`tacz:sight_rmr_dot`)、SRO ミニ ドットサイト (`tacz:sight_sro_dot`)、Coyote サイト (`tacz:sight_coyote`)、EXP3 HCOG (`tacz:sight_exp3`)、Militech 552 HCOG (`tacz:sight_552`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)、sight_p90 (`tacz:sight_p90`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Mirage サイレンサー (`tacz:muzzle_silencer_mirage`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、PO-2 "Ptlopsis" サイレンサー (`tacz:muzzle_silencer_ptilopsis`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)、Wraith サイレンサー (`tacz:muzzle_silencer_wraith`)
- レーザー: Militech コンパクトレーザー (`tacz:laser_compact`)、Nightstick コンパクトレーザー (`tacz:laser_nightstick`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

### スナイパー

#### Accuracy International AWM (`tacz:ai_awp`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- 拡張マガジン: スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_3`)、スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_2`)、スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### M95 .50口径対物ライフル (`tacz:m95`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Vulture .50 サプレッサー (`tacz:muzzle_silencer_vulture`)
- 拡張マガジン: スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_3`)、スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_2`)、スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### M700 スナイパーライフル (`tacz:m700`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Cthulhu K7 マズルブレーキ (`tacz:muzzle_brake_cthulhu`)、Cyclone D2 マズルブレーキ (`tacz:muzzle_brake_cyclone_d2`)、Knight QD サイレンサー (`tacz:muzzle_silencer_knight_qd`)、Phantom S1 サイレンサー (`tacz:muzzle_silencer_phantom_s1`)、Pioneer A3 マズルブレーキ (`tacz:muzzle_brake_pioneer`)、Tempest Trident コンペンセイター (`tacz:muzzle_compensator_trident`)、T-rex ヘビーマズルブレーキ (`tacz:muzzle_brake_trex`)、Ursus ミリタリー標準サイレンサー (`tacz:muzzle_silencer_ursus`)
- 拡張マガジン: スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_3`)、スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_2`)、スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### M107 スナイパーライフル (`tacz:m107`)
- スコープ / サイト: Trijicon SRS-02 ドットサイト (`tacz:sight_srs_02`)、Aimpoint ACRO P-1 & 20mmマウント (`tacz:sight_acro_rifle`)、Coyote サイト (`tacz:sight_coyote`)、DeltaPoint & 20mmマウント (`tacz:sight_deltapoint_rifle`)、EXP3 HCOG (`tacz:sight_exp3`)、FastFire & Burris 20mmマウント (`tacz:sight_fastfire_rifle`)、HAMR 3x スコープ (`tacz:scope_hamr`)、Militech 552 HCOG (`tacz:sight_552`)、OKP-7 サイト (`tacz:sight_okp7`)、PK06 & 20mmマウント (`tacz:sight_pk06_rifle`)、T2 ドットサイト (`tacz:sight_t2`)、UH-1 HCOG (`tacz:sight_uh1`)、Elcan 4倍スコープ (`tacz:scope_elcan_4x`)、LPVO 1-6x スコープ (`tacz:scope_vudu`)、LPVO 1-6x スコープ (`tacz:scope_lpvo_1_6`)、Mark 5 HD 5-25x スコープ (`tacz:scope_mk5hd`)、QMK-152 ホワイトライト サイト (`tacz:scope_qmk152`)、TA31 2倍ACOG (`tacz:scope_acog_ta31`)、標準 5-10x スコープ (`tacz:scope_standard_8x`)、Contender 4x スコープ (`tacz:scope_contender`)
- マズル / バヨネット: Vulture .50 サプレッサー (`tacz:muzzle_silencer_vulture`)
- 拡張マガジン: スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_3`)、スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_2`)、スナイパー弾薬用拡張マガジン (`tacz:sniper_extended_mag_1`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)、炸裂弾 (`tacz:ammo_mod_he`)

#### スプリングフィールド 1873 トラップドアライフル (`tacz:springfield1873`)
- スコープ / サイト: ヴィンテージスプリングフィールドスコープ (`tacz:scope_1873_6x`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

#### Mauser Kar98k (`tacz:kar98`)
- スコープ / サイト: Mauser 4倍軽量スコープ (`tacz:scope_98k`)
- 弾薬MOD: ホローポイント弾 (`tacz:ammo_mod_hp`)、完全被甲弾 (`tacz:ammo_mod_fmj`)、焼夷弾 (`tacz:ammo_mod_i`)

