import type { Category, Content, Subtopic } from "@/types/content";

export type { Category, Content, Subtopic };

/**
 * Bundled last-known-good content snapshot.
 *
 * Content is now sourced from Firestore at runtime (see lib/content). This file
 * is retained as the offline/first-run fallback so the app still renders in
 * low-connectivity environments before the first successful fetch. Regenerate it
 * from Firestore when the published content changes meaningfully.
 */
const content: Content = {
  categories: [
    {
      id: "1-atrial-septum",
      title: "1. Atrial Septum",
      subtitle: "ASD, PFO, IAS",
      subtopics: [
        { id: "atrial-septal-puncture", title: "Atrial Septal Puncture" },
        { id: "atrial-septostomy", title: "Atrial Septostomy" },
        { id: "atrial-shunt-therapy", title: "Atrial Shunt Therapy" },
        { id: "asd-closure", title: "ASD Closure" },
        { id: "pfo-closure", title: "PFO Closure" },
      ],
    },
    {
      id: "2-aortic-valve",
      title: "2. Aortic Valve",
      subtitle: "Valvuloplasty, TAVR, PVL",
      subtopics: [
        {
          id: "aortic-balloon-valvuloplasty",
          title: "Aortic Valve Balloon Valvuloplasty",
        },
        { id: "tavr", title: "TAVR" },
        { id: "aortic-pvl-closure", title: "Aortic Valve PVL Closure" },
        { id: "electrocautery", title: "Electrocautery Procedures" },
      ],
    },
    {
      id: "3-mitral-valve",
      title: "3. Mitral Valve",
      subtitle: "TEER, TMVR, PVL, LAMPOON",
      subtopics: [
        {
          id: "setting-up-mpr",
          title: "Setting up MPR",
          slides: [
            {
              id: "mpr-img1",
              type: "image",
              uri: "https://drive.google.com/file/d/1xZ9FMYpFr2Ly1OXnP5FVkCEgvlXP6QHt/view?usp=drive_link",
              caption: "test",
            },
            {
              id: "mpr-img2",
              type: "image",
              uri: "https://drive.google.com/file/d/1-J2jLv_eIF7I3EnmMZ1df-6jWwIPtNaW/view?usp=drive_link",
            },
            {
              id: "mpr-img3",
              type: "image",
              uri: "https://drive.google.com/file/d/19gf4ozqnIGvO1kmqTtxHZa05IsIImUi1/view?usp=drive_link",
            },
            {
              id: "mpr-img4",
              type: "image",
              uri: "https://drive.google.com/file/d/1QLgu82_20EBHKJeSGYZRQNgiySo5XEn0/view?usp=drive_link",
            },
            {
              id: "mpr-img5",
              type: "image",
              uri: "https://drive.google.com/file/d/11Uimid85VL4iL99wg2uGHhMBTNY13IAi/view?usp=drive_link",
            },
            {
              id: "mpr-img6",
              type: "image",
              uri: "https://drive.google.com/file/d/1iEJoPpzPMDj5F86zISyLz7fSCE6a6GXu/view?usp=drive_link",
            },
            {
              id: "mpr-img7",
              type: "image",
              uri: "https://drive.google.com/file/d/1suEssnPt7ceV__1Um5QqQ4YsALCB7MY6/view?usp=drive_link",
            },
            {
              id: "mpr-img8",
              type: "image",
              uri: "https://drive.google.com/file/d/1UJvGkPBVtYzQclH5iC6CRQJZWY3JJusa/view?usp=drive_link",
            },
            {
              id: "mpr-img9",
              type: "image",
              uri: "https://drive.google.com/file/d/1wgbn9GFti-kMw4GV117Br91Fa1_eyZig/view?usp=drive_link",
            },
            {
              id: "mpr-img10",
              type: "image",
              uri: "https://drive.google.com/file/d/1khblO6lk1r0q74JyjE11p50HMhzz-ZhO/view?usp=drive_link",
            },
            {
              id: "mpr-img11",
              type: "image",
              uri: "https://drive.google.com/file/d/1ufUl-uTbKn-C7hWKnBzXgTnBDM7QBOs0/view?usp=drive_link",
            },
            {
              id: "mpr-img12",
              type: "image",
              uri: "https://drive.google.com/file/d/1rOEBGhWwbnnzPyCYs5Qjr8pl9KSnKIMm/view?usp=drive_link",
            },
            {
              id: "mpr-img13",
              type: "image",
              uri: "https://drive.google.com/file/d/15NFO4DJDIUf2gX1H7uhdNiu2zo5s7U33/view?usp=drive_link",
            },
            {
              id: "mpr-img14",
              type: "image",
              uri: "https://drive.google.com/file/d/1tCUb4kraYhTUIkkJ5txwiYnlQLLFFpQC/view?usp=drive_link",
            },
            {
              id: "mpr-vid1",
              type: "video",
              uri: "https://drive.google.com/file/d/13vbVhebearLUUdowI0Su8xv_3KxMo64k/view?usp=drive_link",
            },
            {
              id: "mpr-vid2",
              type: "video",
              uri: "https://drive.google.com/file/d/1V1H1Lc92R_KFSYl8VVdQALzYbnhs_zOC/view?usp=drive_link",
            },
            {
              id: "mpr-vid3",
              type: "video",
              uri: "https://drive.google.com/file/d/1qJpb2eI74-ns3Ui3P4ux6xUTYlWlwX8q/view?usp=drive_link",
            },
            {
              id: "mpr-vid4",
              type: "video",
              uri: "https://drive.google.com/file/d/1qsVEWO99TEgLqemqL8fFeb-8IC_PSg5G/view?usp=drive_link",
            },
            {
              id: "mpr-vid5",
              type: "video",
              uri: "https://drive.google.com/file/d/1N3vHag9xI6K_P71imwOs7X-UG9iFzCPS/view?usp=drive_link",
            },
            {
              id: "mpr-vid6",
              type: "video",
              uri: "https://drive.google.com/file/d/1FpMMbFBCotmlO8JDDJ7QL5qSDQEdiM9H/view?usp=drive_link",
            },
            {
              id: "mpr-vid7",
              type: "video",
              uri: "https://drive.google.com/file/d/1MpUujKLtpl3eNpsoAgd04TT20I6xBF0g/view?usp=drive_link",
            },
            {
              id: "mpr-vid8",
              type: "video",
              uri: "https://drive.google.com/file/d/1CK4B8a-FtVgOnIAMHSxKIWk6qVRX2r8Q/view?usp=drive_link",
            },
            {
              id: "mpr-vid9",
              type: "video",
              uri: "https://drive.google.com/file/d/1BEoWpQ7hQDB3M9IO_HoyuwEbxZrmaY0W/view?usp=drive_link",
            },
            {
              id: "mpr-vid10",
              type: "video",
              uri: "https://drive.google.com/file/d/10ev5bL3VwVzIWtBIQvbB9gHaBd00fM9u/view?usp=drive_link",
            },
            {
              id: "mpr-vid11",
              type: "video",
              uri: "https://drive.google.com/file/d/1Z-2saXH5h9INXBZ5VyYNGbi772g9N2WC/view?usp=drive_link",
            },
            {
              id: "mpr-vid12",
              type: "video",
              uri: "https://drive.google.com/file/d/1tbwZUxgcugaaYzljX7pxhbV6H8j-pzzh/view?usp=drive_link",
            },
          ],
        },
        { id: "m-teer", title: "M-TEER" },
        { id: "mitral-valvuloplasty", title: "Mitral Valvuloplasty" },
        {
          id: "tmvr",
          title: "TMVR",
          children: [
            {
              id: "valve-in-valve",
              title: "Mitral Valve-in-Valve",
              description: "Clinical steps and imaging",
              slides: [
                // Text-only procedural overview slides
                {
                  id: "mviv-text1",
                  type: "text",
                  title: "Patient Preparation",
                  content: `General anesthesia with TEE guidance
Femoral venous access (large-bore) ± arterial access for monitoring
Temporary pacing setup (RV or LV wire)
Baseline hemodynamics and invasive LA pressure measurement
Anticoagulation with heparin (ACT goal typically >250–300 s)`,
                },
                {
                  id: "mviv-text2",
                  type: "text",
                  title: "Transseptal Access",
                  content: `TEE-guided transseptal puncture:
• Posterior and inferior septal location
• Height optimized for coaxial mitral alignment

Advance guidewire into left atrium
Septal dilation with balloon or dilator to accommodate delivery system
Place stiff guidewire (e.g., Safari, Lunderquist) into LV apex`,
                },
                {
                  id: "mviv-text3",
                  type: "text",
                  title: "Valve Crossing and Positioning",
                  content: `Cross failed surgical mitral valve with catheter and wire
Confirm stable wire position in LV
Advance transcatheter valve delivery system across interatrial septum

Position valve within surgical bioprosthesis:
• Align using surgical valve fluoroscopic markers
• Target ~80–90% ventricular / 10–20% atrial deployment
• Confirm coaxial alignment with fluoroscopy and TEE`,
                },
                {
                  id: "mviv-text4",
                  type: "text",
                  title: "Valve Deployment",
                  content: `Rapid ventricular pacing (if needed)
Balloon-expandable valve deployment under fluoroscopy and TEE
Controlled inflation to ensure accurate positioning
Assess for valve stability and paravalvular leak`,
                },
                {
                  id: "mviv-text5",
                  type: "text",
                  title: "Post-Deployment Assessment",
                  content: `TEE evaluation:
• Mitral valve gradients and effective orifice
• Paravalvular regurgitation
• LVOT gradient and flow acceleration
• Valve position and leaflet motion

Hemodynamic assessment:
• LA pressure and V-waves
• LVOT gradient if concern for obstruction
• Consider post-dilation if residual gradient or underexpansion`,
                },
                {
                  id: "mviv-text6",
                  type: "text",
                  title: "Completion and Closure",
                  content: `Remove delivery system and guidewires

Assess interatrial septum:
• Evaluate for significant left-to-right shunt
• Consider ASD closure if indicated

Reverse anticoagulation as appropriate
Venous access site closure`,
                },
                // Media slides with Drive links
                {
                  id: "mviv-vid1",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1w5Sqd05mcC9Phb5WNXPO480PVTybqXL2/view?usp=share_link",
                  caption: "Bioprosthetic Mitral Valve Stenosis",
                },
                {
                  id: "mviv-vid2",
                  type: "video",
                  uri: "https://drive.google.com/file/d/12CcTrZOiwzZ3GgdUl6nPviMhJ0-6PFSw/view?usp=drive_link",
                  caption: "3D View of Stenotic Mitral Valve",
                },
                {
                  id: "mviv-vid3",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1LCtEUlyvGjhyS7uZ03wlwUfA8tF4ue5y/view?usp=drive_link",
                  caption: "3D Color View of Stenotic Mitral Valve",
                },
                {
                  id: "mviv-img4",
                  type: "image",
                  uri: "https://drive.google.com/file/d/1SS_bmFaYvMm8AHPh86VQO3Updi2oetZE/view?usp=drive_link",
                  caption: "MPG at baseline",
                },
                {
                  id: "mviv-img5",
                  type: "image",
                  uri: "https://drive.google.com/file/d/1XV4YxroXr3nuCbkiXO_z-rNmckjZUpzO/view?usp=drive_link",
                  caption: "MVA by MPR Planimetry",
                },
                {
                  id: "mviv-vid6",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1E4r-gMv3uhQDwrM-RKTisl_2CyoS-5AK/view?usp=drive_link",
                  caption: "Interatrial Septum",
                },
                {
                  id: "mviv-vid7",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1paUfUJIM4biAfjhy3NoDgzJ77-eor7o-/view?usp=drive_link",
                  caption:
                    "TEE-guided Transseptal Puncture - Tenting of the interatrial septum - Posterior and inferior septal location is ideal - Height optimized for coaxial mitral alignment",
                },
                {
                  id: "mviv-img7",
                  type: "image",
                  uri: "https://drive.google.com/file/d/102X587wi1Roit6l4r-98oegOPucd1Ocd/view?usp=drive_link",
                  caption:
                    "Crossing MV with Guidewire - Advance guidewire into left atriumPlace stiff guidewire (e.g., Safari, Lunderquist) into LV apex",
                },
                {
                  id: "mviv-img8",
                  type: "image",
                  uri: "https://drive.google.com/file/d/1TzwEi_QYRTKGxDsv_bYoQC_6LYXx_gqZ/view?usp=drive_link",
                  caption: "Safari Guidewire in LV apical position",
                },
                {
                  id: "mviv-vid9",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1YSyzC0sUsMj1AEU6hUtjmECwuj55CP0e/view?usp=drive_link",
                  caption:
                    "Balloon Septostomy - Septal dilation with balloon or dilator to accommodate delivery system",
                },
                {
                  id: "mviv-vid10",
                  type: "video",
                  uri: "https://drive.google.com/file/d/11M8V7s0M0J1UnTqN7qFkyJymMzMxSZsg/view?usp=drive_link",
                  caption:
                    "Positioning Balloon Expandable Valve - Cross failed surgical mitral valve with catheter and wireConfirm stable wire position in LV Advance transcatheter valve delivery system across interatrial septum Position valve within surgical bioprosthesis: Align using surgical valve fluoroscopic markers Target ~80–90% ventricular / 10–20% atrial deployment Confirm coaxial alignment with fluoroscopy and TEE",
                },
                {
                  id: "mviv-vid11",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1mRiPjWIWAfgJGIl8CA0HS_-hT9FGBYxC/view?usp=drive_link",
                  caption:
                    "Deploying Valve under Rapid Ventricular Pacing - Rapid ventricular pacing (if needed) Balloon-expandable valve deployment under fluoroscopy and TEE Controlled inflation to ensure accurate positioning Assess for valve stability and paravalvular leak",
                },
                {
                  id: "mviv-vid12",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1UbvOg0lEaZT1Qe7_0-hdnZcMBBw8l_ZL/view?usp=drive_link",
                  caption: "Sapien S3 Valve Deployment over Safari Wire",
                },
                {
                  id: "mviv-vid13",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1lXyiAOk6oCYDWomUZ5zV4-H1m2kadJf3/view?usp=drive_link",
                  caption:
                    "3D Deployed Sapien Valve - TEE evaluation post deployment: Mitral valve gradients and effective orifice Paravalvular regurgitation LVOT gradient and flow acceleration Valve position and leaflet motion",
                },
                {
                  id: "mviv-vid20",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1CpUh_jog8lI1iqOS9zWqrVeOR-j2khr2/view?usp=drive_link",
                  caption:
                    "3D Color Deployed Sapien Valve - No PVL by 3D Color Doppler",
                },
                {
                  id: "mviv-img15",
                  type: "image",
                  uri: "https://drive.google.com/file/d/1Wd_rLrZBPBRsGK931eqMR4-sBpaBIjed/view?usp=drive_link",
                  caption:
                    "MV MPG after valve deployment - MPG of 2mmHg indicates no valve stenosis",
                },
                {
                  id: "mviv-vid16",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1PV6LPUHZhXr8_zZKGoRSgPNKfY0ZVyjs/view?usp=drive_link",
                  caption:
                    "2D and CFD of deployed Sapien valve - Valve is well seated; leaflets open well and no PVL",
                },
                {
                  id: "mviv-vid14",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1cJZq5qPxGPw3FuqrnS_Z2N8ijhKYgVx0/view?usp=drive_link",
                  caption:
                    "Iatrogenic shunt after removal of delivery sheath - Assess interatrial septum: Evaluate for significant left-to-right shunt Consider ASD closure if indicated (bi-directional of right-to-left)",
                },
                {
                  id: "mviv-vid18",
                  type: "video",
                  uri: "https://drive.google.com/file/d/1Wid1HmIVuSkN4HyQNVXQfllgQ7UIPweY/view?usp=drive_link",
                  caption:
                    "CFD of LVOT without obstruction - Evaluate LVOT for obstruction",
                },
                {
                  id: "mviv-vid19",
                  type: "image",
                  uri: "https://drive.google.com/file/d/1E7Ca-z3sPnDVdUkTiDNLdB68vvRzkfl7/view?usp=drive_link",
                  caption:
                    "CWD gradient across LVOT/Aortic valve - CW Doppler indicates a low peak gradient of 3mmHg ",
                },
              ],
            },
            { id: "valve-in-ring", title: "Mitral Valve-in-Ring" },
            { id: "valve-in-mac", title: "Mitral Valve-in-MAC" },
            { id: "investigational", title: "Investigational Valves" },
            { id: "mitral-valve-plug", title: "Mitral Valve Plug" },
          ],
        },
        { id: "pvl-closure", title: "Mitral PVL Closure" },
        { id: "mitral-valve-plug", title: "Mitral Valve Plug" },
        { id: "lampoon", title: "LAMPOON Procedure" },
      ],
    },
    {
      id: "4-tricuspid-valve",
      title: "4. Tricuspid Valve",
      subtitle: "T-TEER, TMVR",
      subtopics: [
        { id: "t-teer", title: "T-TEER" },
        { id: "tricuspid-tmvr", title: "TMVR" },
      ],
    },
    {
      id: "5-pulmonic-valve",
      title: "5. Pulmonic Valve",
      subtitle: "TPVR",
      subtopics: [{ id: "tpvr", title: "TPVR" }],
    },
    {
      id: "6-laac-devices",
      title: "6. LAAC Devices",
      subtitle: "Watchman, Amulet, Conformal",
      subtopics: [
        { id: "watchman", title: "Watchman" },
        { id: "amulet", title: "Amulet" },
        { id: "conformal", title: "Conformal" },
        { id: "peri-device-leak-closure", title: "Peri-Device Leak Closure" },
      ],
    },
    {
      id: "7-ventricular-muscle",
      title: "7. Ventricular Muscle",
      subtitle: "VSD, Pseudoaneurysm, ASA",
      subtopics: [
        { id: "vsd-closure", title: "VSD Closure" },
        { id: "pseudoaneurysm-closure", title: "Pseudoaneurysm Closure" },
        { id: "alcohol-septal-ablation", title: "Alcohol Septal Ablation" },
      ],
    },
    {
      id: "8-pulmonary-vessels",
      title: "8. Pulmonary Vessels",
      subtitle: "PV Stenting, PA Stenting",
      subtopics: [
        { id: "pulmonary-vein-stenting", title: "Pulmonary Vein Stenting" },
        { id: "pulmonary-artery-stenting", title: "Pulmonary Artery Stenting" },
      ],
    },
  ],
};

export default content;
