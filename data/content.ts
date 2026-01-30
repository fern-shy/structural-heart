import type { Slide } from '@/types/media';

export type Subtopic = {
  id: string;
  title: string;
  description?: string;
  longText?: string;
  slides?: Slide[];
  children?: Subtopic[];
};

export type Category = {
  id: string;
  title: string;
  subtitle?: string;
  subtopics: Subtopic[];
};

export type Content = {
  categories: Category[];
};

const demoImage = 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?q=80&w=1200&auto=format&fit=crop';
const demoVideo = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';

const content: Content = {
  categories: [
    {
      id: '1-atrial-septum',
      title: '1. Atrial Septum',
      subtitle: 'ASD, PFO, IAS',
      subtopics: [
        {
          id: 'overview',
          title: 'Overview',
          description: 'Key views and anatomy',
          longText:
            'This is sample copy. Replace with clinical text. Tap media to open fullscreen and swipe between slides.',
          slides: [
            { id: 'img1', type: 'image', uri: demoImage, caption: 'Atrial septum anatomy' },
            { id: 'vid1', type: 'video', uri: demoVideo, caption: 'Demo loop video' },
          ],
        },
      ],
    },
    {
      id: '2-aortic-valve',
      title: '2. Aortic Valve',
      subtitle: 'LVEF, LVOT, views',
      subtopics: [
        {
          id: 'basic-views',
          title: 'Basic Views',
          slides: [
            { id: 'img2', type: 'image', uri: demoImage, caption: 'Aortic valve long axis' },
          ],
        },
      ],
    },
    {
      id: '3-mitral-valve',
      title: '3. Mitral Valve',
      subtitle: 'TEER, TMVR, PVL, LAMPOON',
      subtopics: [
        { id: 'lampoon', title: 'LAMPoon Procedure' },
        { id: 'm-teer', title: 'M-TEER' },
        { id: 'mitral-valvuloplasty', title: 'Mitral Valvuloplasty' },
        {
          id: 'tmvr',
          title: 'TMVR',
          children: [
            {
              id: 'valve-in-valve',
              title: 'Mitral Valve-in-Valve',
              description: 'Clinical steps and imaging',
              slides: [
                // Text-only procedural overview slides
                {
                  id: 'mviv-text1',
                  type: 'text',
                  title: 'Patient Preparation',
                  content: `General anesthesia with TEE guidance
Femoral venous access (large-bore) ± arterial access for monitoring
Temporary pacing setup (RV or LV wire)
Baseline hemodynamics and invasive LA pressure measurement
Anticoagulation with heparin (ACT goal typically >250–300 s)`,
                },
                {
                  id: 'mviv-text2',
                  type: 'text',
                  title: 'Transseptal Access',
                  content: `TEE-guided transseptal puncture:
• Posterior and inferior septal location
• Height optimized for coaxial mitral alignment

Advance guidewire into left atrium
Septal dilation with balloon or dilator to accommodate delivery system
Place stiff guidewire (e.g., Safari, Lunderquist) into LV apex`,
                },
                {
                  id: 'mviv-text3',
                  type: 'text',
                  title: 'Valve Crossing and Positioning',
                  content: `Cross failed surgical mitral valve with catheter and wire
Confirm stable wire position in LV
Advance transcatheter valve delivery system across interatrial septum

Position valve within surgical bioprosthesis:
• Align using surgical valve fluoroscopic markers
• Target ~80–90% ventricular / 10–20% atrial deployment
• Confirm coaxial alignment with fluoroscopy and TEE`,
                },
                {
                  id: 'mviv-text4',
                  type: 'text',
                  title: 'Valve Deployment',
                  content: `Rapid ventricular pacing (if needed)
Balloon-expandable valve deployment under fluoroscopy and TEE
Controlled inflation to ensure accurate positioning
Assess for valve stability and paravalvular leak`,
                },
                {
                  id: 'mviv-text5',
                  type: 'text',
                  title: 'Post-Deployment Assessment',
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
                  id: 'mviv-text6',
                  type: 'text',
                  title: 'Completion and Closure',
                  content: `Remove delivery system and guidewires

Assess interatrial septum:
• Evaluate for significant left-to-right shunt
• Consider ASD closure if indicated

Reverse anticoagulation as appropriate
Venous access site closure`,
                },
                // Media slides with Drive links
                { id: 'mviv-vid1', type: 'video', uri: 'https://drive.google.com/file/d/1w5Sqd05mcC9Phb5WNXPO480PVTybqXL2/view?usp=share_link', caption: 'Bioprosthetic Mitral Valve Stenosis' },
                { id: 'mviv-vid2', type: 'video', uri: 'https://drive.google.com/file/d/12CcTrZOiwzZ3GgdUl6nPviMhJ0-6PFSw/view?usp=drive_link', caption: '3D View of Stenotic Mitral Valve' },
                { id: 'mviv-vid3', type: 'video', uri: 'https://drive.google.com/file/d/1LCtEUlyvGjhyS7uZ03wlwUfA8tF4ue5y/view?usp=drive_link', caption: '3D Color View of Stenotic Mitral Valve' },
                { id: 'mviv-img4', type: 'image', uri: 'https://drive.google.com/file/d/1SS_bmFaYvMm8AHPh86VQO3Updi2oetZE/view?usp=drive_link', caption: 'MPG at baseline' },
                { id: 'mviv-img5', type: 'image', uri: 'https://drive.google.com/file/d/1XV4YxroXr3nuCbkiXO_z-rNmckjZUpzO/view?usp=drive_link', caption: 'MVA by MPR Planimetry' },
                { id: 'mviv-vid6', type: 'video', uri: 'https://drive.google.com/file/d/1E4r-gMv3uhQDwrM-RKTisl_2CyoS-5AK/view?usp=drive_link', caption: 'Interatrial Septum' },
                { id: 'mviv-vid7', type: 'video', uri: 'https://drive.google.com/file/d/1paUfUJIM4biAfjhy3NoDgzJ77-eor7o-/view?usp=drive_link', caption: 'TEE-guided Transseptal Puncture - Tenting of the interatrial septum - Posterior and inferior septal location is ideal - Height optimized for coaxial mitral alignment' },
                { id: 'mviv-img7', type: 'image', uri: 'https://drive.google.com/file/d/102X587wi1Roit6l4r-98oegOPucd1Ocd/view?usp=drive_link', caption: 'Crossing MV with Guidewire - Advance guidewire into left atriumPlace stiff guidewire (e.g., Safari, Lunderquist) into LV apex' },
                { id: 'mviv-img8', type: 'image', uri: 'https://drive.google.com/file/d/1TzwEi_QYRTKGxDsv_bYoQC_6LYXx_gqZ/view?usp=drive_link', caption: 'Safari Guidewire in LV apical position' },
                { id: 'mviv-vid9', type: 'video', uri: 'https://drive.google.com/file/d/1YSyzC0sUsMj1AEU6hUtjmECwuj55CP0e/view?usp=drive_link', caption: 'Balloon Septostomy - Septal dilation with balloon or dilator to accommodate delivery system' },
                { id: 'mviv-vid10', type: 'video', uri: 'https://drive.google.com/file/d/11M8V7s0M0J1UnTqN7qFkyJymMzMxSZsg/view?usp=drive_link', caption: 'Positioning Balloon Expandable Valve - Cross failed surgical mitral valve with catheter and wireConfirm stable wire position in LV Advance transcatheter valve delivery system across interatrial septum Position valve within surgical bioprosthesis: Align using surgical valve fluoroscopic markers Target ~80–90% ventricular / 10–20% atrial deployment Confirm coaxial alignment with fluoroscopy and TEE' },
                { id: 'mviv-vid11', type: 'video', uri: 'https://drive.google.com/file/d/1mRiPjWIWAfgJGIl8CA0HS_-hT9FGBYxC/view?usp=drive_link', caption: 'Deploying Valve under Rapid Ventricular Pacing - Rapid ventricular pacing (if needed) Balloon-expandable valve deployment under fluoroscopy and TEE Controlled inflation to ensure accurate positioning Assess for valve stability and paravalvular leak' },
                { id: 'mviv-vid12', type: 'video', uri: 'https://drive.google.com/file/d/1UbvOg0lEaZT1Qe7_0-hdnZcMBBw8l_ZL/view?usp=drive_link', caption: 'Sapien S3 Valve Deployment over Safari Wire' },
                { id: 'mviv-vid13', type: 'video', uri: 'https://drive.google.com/file/d/1lXyiAOk6oCYDWomUZ5zV4-H1m2kadJf3/view?usp=drive_link', caption: '3D Deployed Sapien Valve - TEE evaluation post deployment: Mitral valve gradients and effective orifice Paravalvular regurgitation LVOT gradient and flow acceleration Valve position and leaflet motion' },
                { id: 'mviv-vid20', type: 'video', uri: 'https://drive.google.com/file/d/1CpUh_jog8lI1iqOS9zWqrVeOR-j2khr2/view?usp=drive_link', caption: '3D Color Deployed Sapien Valve - No PVL by 3D Color Doppler' },
                { id: 'mviv-img15', type: 'image', uri: 'https://drive.google.com/file/d/1Wd_rLrZBPBRsGK931eqMR4-sBpaBIjed/view?usp=drive_link', caption: 'MV MPG after valve deployment - MPG of 2mmHg indicates no valve stenosis' },
                { id: 'mviv-vid16', type: 'video', uri: 'https://drive.google.com/file/d/1PV6LPUHZhXr8_zZKGoRSgPNKfY0ZVyjs/view?usp=drive_link', caption: '2D and CFD of deployed Sapien valve - Valve is well seated; leaflets open well and no PVL' },
                { id: 'mviv-vid14', type: 'video', uri: 'https://drive.google.com/file/d/1cJZq5qPxGPw3FuqrnS_Z2N8ijhKYgVx0/view?usp=drive_link', caption: 'Iatrogenic shunt after removal of delivery sheath - Assess interatrial septum: Evaluate for significant left-to-right shunt Consider ASD closure if indicated (bi-directional of right-to-left)' },
                { id: 'mviv-vid18', type: 'video', uri: 'https://drive.google.com/file/d/1Wid1HmIVuSkN4HyQNVXQfllgQ7UIPweY/view?usp=drive_link', caption: 'CFD of LVOT without obstruction - Evaluate LVOT for obstruction' },
                { id: 'mviv-vid19', type: 'image', uri: 'https://drive.google.com/file/d/1E7Ca-z3sPnDVdUkTiDNLdB68vvRzkfl7/view?usp=drive_link', caption: 'CWD gradient across LVOT/Aortic valve - CW Doppler indicates a low peak gradient of 3mmHg ' },
                

              ],
            },
            { id: 'valve-in-ring', title: 'Mitral Valve-in-Ring' },
            { id: 'valve-in-mac', title: 'Mitral Valve-in-MAC' },
            { id: 'investigational', title: 'Investigational Valves' },
            { id: 'mitral-valve-plug', title: 'Mitral Valve Plug' },
          ],
        },
        { id: 'pvl-closure', title: 'Mitral PVL Closure' },
      ],
    },
  ],
};

export default content;


