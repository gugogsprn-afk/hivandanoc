/** Department name / description / services for HY and EN */
module.exports = {
  hyNames: {
    'consult-spine': 'Օրթոպեդ-տրավմատոլոգի խորհրդատվություն',
    'consult-neuro': 'Նյարդաբանի խորհրդատվություն',
    'manual-therapy': 'Մանուալ թերապիա',
    osteopathy: 'Օստեոպատիա',
    physiotherapy: 'Ֆիզիոթերապիա',
    kinesiotherapy: 'Բուժիչ ֆիզկուլտուրա (ԼՖԿ)',
    massage: 'Բուժական մերսում',
    acupuncture: 'Իգլորեֆլեքսոթերապիա',
    electrotherapy: 'Էլեկտրոթերապիա',
    'ultrasound-therapy': 'Ուլտրաձայնային թերապիա',
    magnetotherapy: 'Մագնիսաթերապիա',
    'laser-therapy': 'Լազերային թերապիա',
    shockwave: 'Շոկային ալիքի թերապիա',
    traction: 'Տրակցիոն թերապիա',
    taping: 'Կինեզիոտեյպավորում',
    'hernia-treatment': 'Միջողային սկավառակի ճողվածքի բուժում',
    osteochondrosis: 'Օստեոխոնդրոզի բուժում',
    scoliosis: 'Սկոլիոզի բուժում',
    protrusion: 'Պրոտրուզիայի բուժում',
    radiculitis: 'Ռադիկուլիտի բուժում',
    arthrosis: 'Հոդերի արթրոզի բուժում',
    posture: 'Կարգավորի ուղղում',
    'block-injection': 'Բլոկադաներ և շրջանարկումներ',
    'rehab-trauma': 'Վերականգնում վնասվածքից հետո',
    'rehab-surgery': 'Վերականգնում վիրահատությունից հետո',
    'sports-rehab': 'Սպորտային վերականգնում',
    'pediatric-spine': 'Մանկական օրթոպեդիա և սկոլիոզ',
    'ultrasound-diag': 'Ուլտրաձայնային ախտորոշում',
    xray: 'Ռենտգենոգրաֆիա',
    'mri-referral': 'ՄՌՏ (ուղղորդում)'
  },
  enNames: {
    'consult-spine': 'Orthopedic consultation',
    'consult-neuro': 'Neurologist consultation',
    'manual-therapy': 'Manual therapy',
    osteopathy: 'Osteopathy',
    physiotherapy: 'Physiotherapy',
    kinesiotherapy: 'Therapeutic exercise (kinesiotherapy)',
    massage: 'Therapeutic massage',
    acupuncture: 'Acupuncture',
    electrotherapy: 'Electrotherapy',
    'ultrasound-therapy': 'Ultrasound therapy',
    magnetotherapy: 'Magnetotherapy',
    'laser-therapy': 'Laser therapy',
    shockwave: 'Shock wave therapy',
    traction: 'Spinal traction therapy',
    taping: 'Kinesio taping',
    'hernia-treatment': 'Spinal disc hernia treatment',
    osteochondrosis: 'Osteochondrosis treatment',
    scoliosis: 'Scoliosis treatment',
    protrusion: 'Disc protrusion treatment',
    radiculitis: 'Radiculitis treatment',
    arthrosis: 'Joint arthrosis treatment',
    posture: 'Posture correction',
    'block-injection': 'Nerve blocks and injections',
    'rehab-trauma': 'Rehabilitation after injury',
    'rehab-surgery': 'Post-surgical rehabilitation',
    'sports-rehab': 'Sports rehabilitation',
    'pediatric-spine': 'Pediatric orthopedics and scoliosis',
    'ultrasound-diag': 'Ultrasound diagnostics',
    xray: 'X-ray imaging',
    'mri-referral': 'MRI (referral)'
  },
  hyDetails: {
    'consult-spine': {
      description: 'Առաջին և կրկնակի ընդունելություն, պոզանոցի և հոդերի վիճակի գնահատում, բուժման պլան։',
      services: ['Առաջին խորհրդատվություն', 'Կրկնակի ընդունելություն', 'Վերականգնման պլանի կազմում']
    },
    'consult-neuro': {
      description: 'Պոզանոցի հիվանդությունների նյարդաբանական արտահայտությունների ախտորոշում։',
      services: ['Նյարդաբանական զննում', 'Ցավային համակարգի գնահատում', 'Հետազոտությունների նշանակում']
    },
    'manual-therapy': {
      description: 'Ձեռքի տեխնիկաներ ցավը նվազեցնելու, պոզանոցի և հոդերի շարժունակությունը վերականգնելու համար։',
      services: ['Սեգմենտար մոբիլիզացիա', 'Փափուկ մանուալ տեխնիկաներ', 'Բուժման կուրս']
    },
    osteopathy: {
      description: 'Շարժական համակարգի հավասարակշռությունը վերականգնելու համապարփակ մոտեցում։',
      services: ['Օստեոպատիկ ընդունելություն', 'Դիսֆունկցիաների ուղղում', 'Բուժման կուրս']
    },
    physiotherapy: {
      description: 'Ապարատային մեթոդներ պոզանոցի և հոդերի ցավի և բորբոքման բուժման համար։',
      services: ['Էլեկտրոթերապիա', 'Ուլտրաձայնային թերապիա', 'Մագնիսաթերապիա', 'Լազերային թերապիա']
    },
    kinesiotherapy: {
      description: 'Անհատական վարժություններ մկանային կորսետը ամրացնելու և շարժունակությունը վերականգնելու համար։',
      services: ['Անհատական դաս', 'Խմբային դաս', 'Տնային ծրագիր']
    },
    massage: {
      description: 'Մեջքի, պարանոցի և հոդերի մերսում՝ լարվածությունը նվազեցնելու և արյան շրջանառությունը բարելավելու համար։',
      services: ['Դասական մերսում', 'Կետային մերսում', 'Սպորտային մերսում']
    },
    acupuncture: {
      description: 'Կենսաբանական ակտիվ կետերի ազդեցություն ցավը նվազեցնելու և վերականգնելու համար։',
      services: ['Դասական ակուպունկտուրա', 'Էլեկտրակուպունկտուրա', 'Բուժման կուրս']
    },
    electrotherapy: {
      description: 'Տարբեր հաճախականության հոսքերով բուժում մեջքի և հոդերի ցավի դեպքում։',
      services: ['Դիադինամիկ հոսքեր', 'Ինտերֆերենց հոսքեր', 'Միոյստիմուլյացիա']
    },
    'ultrasound-therapy': {
      description: 'Ուլտրաձայնային բուժում ներքին օրգանների և հոդերի համար։',
      services: ['Ուլտրաձայնային թերապիա պոզանոցի', 'Ուլտրաձայնային թերապիա հոդերի']
    },
    magnetotherapy: {
      description: 'Մագնիսական դաշտ ցավը նվազեցնելու և հյուսվածքների վերականգնումը արագացնելու համար։',
      services: ['Տեղային մագնիսաթերապիա', 'Ընդհանուր մագնիսաթերապիա']
    },
    'laser-therapy': {
      description: 'Ցածր ինտենսիվության լազերային ճառագայթում բորբոքումի և ցավի դեպքում։',
      services: ['Լազերային թերապիա մեջքի', 'Լազերային թերապիա հոդերի']
    },
    shockwave: {
      description: 'Շոկային ալիքի թերապիա քրոնիկական ցավերի, կրունոգի սպորի և հոդերի դեպքում։',
      services: ['Շոկային ալիք պոզանոցի', 'Շոկային ալիք հոդերի', 'Շոկային ալիք ներքին օրգանների']
    },
    traction: {
      description: 'Պոզանոցի ձգում միջպոզանոցային սկավառակների վրա ճնշումը նվազեցնելու համար։',
      services: ['Չոր ձգում', 'Ջրի տակ ձգում', 'Բուժման կուրս']
    },
    taping: {
      description: 'Էլաստիկ ժապավեններով մկանների և հոդերի ամրացում և աջակցություն։',
      services: ['Տեյպավորում մեջքի', 'Տեյպավորում հոդերի', 'Սպորտային տեյպավորում']
    },
    'hernia-treatment': {
      description: 'Միջպոզանոցային սկավառակի հերնիայի կոնսերվատիվ բուժում առանց վիրահատության։',
      services: ['Համակցված թերապիա', 'Դեղամիջոցային աջակցություն', 'Ռեաբիլիտացիա']
    },
    osteochondrosis: {
      description: 'Պոզանոցի դեգեներատիվ փոփոխությունների համակցված բուժում։',
      services: ['Պարանոցի օստեոխոնդրոզ', 'Գոտկային օստեոխոնդրոզ', 'Բուժման կուրս']
    },
    scoliosis: {
      description: 'Պոզանոցի թեքության ուղղում և բուժում մեծահասակների և երեխաների մոտ։',
      services: ['Կոնսերվատիվ ուղղում', 'ԼՖԿ սկոլիոզի դեպքում', 'Դիտարկում']
    },
    protrusion: {
      description: 'Սկավառակի պրոտրուզիայի բուժում վաղ փուլում։',
      services: ['Կոնսերվատիվ թերապիա', 'Ֆիզիոթերապիա', 'ԼՖԿ']
    },
    radiculitis: {
      description: 'Ցավի և բորբոքման նվազեցում նյարդային արմատների սեղմման դեպքում։',
      services: ['Դեղամիջոցային թերապիա', 'Ֆիզիոպրոցեդուրաներ', 'Բլոկադաներ']
    },
    arthrosis: {
      description: 'Ծնկի, թազա-ազդրի և այլ հոդերի արթրոզի կոնսերվատիվ բուժում։',
      services: ['Խորհրդատվություն', 'Ֆիզիոթերապիա', 'ԼՖԿ և մերսում']
    },
    posture: {
      description: 'Կարգավորի խանգարումների ախտորոշում և ուղղում։',
      services: ['Կարգավորի գնահատում', 'Վարժություններ', 'Դինամիկայի վերահսկում']
    },
    'block-injection': {
      description: 'Շրջանարկումային թերապիա արտահայտ ցավային համակարգի դեպքում։',
      services: ['Պարավերտեբրալ բլոկադա', 'Հոդերի ներսարկումներ']
    },
    'rehab-trauma': {
      description: 'Պոզանոցի և հոդերի վնասվածքներից հետո վերականգնում։',
      services: ['Անհատական ծրագիր', 'Փուլային բեռնում', 'Բժշկի վերահսկողություն']
    },
    'rehab-surgery': {
      description: 'Պոզանոցի և հոդերի վիրահատություններից հետո վերականգնում։',
      services: ['Վաղ փուլ', 'Ուշ փուլ', 'Ամբուլատոր ռեաբիլիտացիա']
    },
    'sports-rehab': {
      description: 'Շարժական համակարգի վնասվածքներից հետո մարզումներին վերադարձ։',
      services: ['Պատրաստվածության գնահատում', 'Վերականգնման ծրագիր', 'Պրոֆիլակտիկա']
    },
    'pediatric-spine': {
      description: 'Երեխաների կարգավորի խանգարումների և սկոլիոզի դիտարկում և բուժում։',
      services: ['Զննում', 'ԼՖԿ', 'Կորսետային ուղղում']
    },
    'ultrasound-diag': {
      description: 'Հոդերի և ներքին օրգանների ուլտրաձայնային հետազոտություն։',
      services: ['Ուլտրաձայն հոդերի', 'Ուլտրաձայն ներքին օրգանների', 'Ուլտրաձայն պոզանոցի']
    },
    xray: {
      description: 'Պոզանոցի և հոդերի ռենտգենային հետազոտություն։',
      services: ['Ռենտգեն պոզանոցի', 'Ռենտգեն հոդերի', 'Ֆունկցիոնալ նկարներ']
    },
    'mri-referral': {
      description: 'ՄՌՏ ուղղորդում և հետազոտության արդյունքների մեկնաբանություն։',
      services: ['ՄՌՏ ուղղորդում', 'Խորհրդատվություն արդյունքների վերաբերյալ']
    }
  },
  enDetails: {
    'consult-spine': {
      description: 'Initial and follow-up visits, spine and joint assessment, treatment planning.',
      services: ['Initial consultation', 'Follow-up visit', 'Rehabilitation plan']
    },
    'consult-neuro': {
      description: 'Diagnosis of neurological symptoms in spinal conditions.',
      services: ['Neurological exam', 'Pain syndrome assessment', 'Test referrals']
    },
    'manual-therapy': {
      description: 'Hands-on techniques to relieve pain and restore spine and joint mobility.',
      services: ['Segmental mobilization', 'Gentle manual techniques', 'Treatment course']
    },
    osteopathy: {
      description: 'Holistic approach to restoring musculoskeletal balance.',
      services: ['Osteopathic session', 'Dysfunction correction', 'Treatment course']
    },
    physiotherapy: {
      description: 'Device-based methods to treat pain and inflammation in spine and joints.',
      services: ['Electrotherapy', 'Ultrasound therapy', 'Magnetotherapy', 'Laser therapy']
    },
    kinesiotherapy: {
      description: 'Individual exercises to strengthen the muscle corset and restore mobility.',
      services: ['Individual session', 'Group session', 'Home program']
    },
    massage: {
      description: 'Back, neck and joint massage to relieve tension and improve circulation.',
      services: ['Classic massage', 'Trigger point massage', 'Sports massage']
    },
    acupuncture: {
      description: 'Stimulation of active points to relieve pain and support recovery.',
      services: ['Classic acupuncture', 'Electroacupuncture', 'Treatment course']
    },
    electrotherapy: {
      description: 'Treatment with currents of various frequencies for back and joint pain.',
      services: ['Diadynamic currents', 'Interference currents', 'Muscle stimulation']
    },
    'ultrasound-therapy': {
      description: 'Ultrasound treatment of soft tissues and joints.',
      services: ['Spine ultrasound therapy', 'Joint ultrasound therapy']
    },
    magnetotherapy: {
      description: 'Magnetic field therapy to reduce pain and speed tissue recovery.',
      services: ['Local magnetotherapy', 'General magnetotherapy']
    },
    'laser-therapy': {
      description: 'Low-intensity laser for inflammation and pain.',
      services: ['Back laser therapy', 'Joint laser therapy']
    },
    shockwave: {
      description: 'Shock wave therapy for chronic pain, heel spurs and joints.',
      services: ['Spine shock wave', 'Joint shock wave', 'Soft tissue shock wave']
    },
    traction: {
      description: 'Spinal traction to reduce pressure on intervertebral discs.',
      services: ['Dry traction', 'Underwater traction', 'Treatment course']
    },
    taping: {
      description: 'Elastic tape support for muscles and joints.',
      services: ['Back taping', 'Joint taping', 'Sports taping']
    },
    'hernia-treatment': {
      description: 'Conservative treatment of disc herniation without surgery.',
      services: ['Combined therapy', 'Medication support', 'Rehabilitation']
    },
    osteochondrosis: {
      description: 'Comprehensive treatment of degenerative spine changes.',
      services: ['Cervical osteochondrosis', 'Lumbar osteochondrosis', 'Treatment course']
    },
    scoliosis: {
      description: 'Correction and treatment of spinal curvature in adults and children.',
      services: ['Conservative correction', 'Exercise therapy for scoliosis', 'Monitoring']
    },
    protrusion: {
      description: 'Early-stage treatment of disc bulging.',
      services: ['Conservative therapy', 'Physiotherapy', 'Therapeutic exercise']
    },
    radiculitis: {
      description: 'Pain and inflammation relief when nerve roots are compressed.',
      services: ['Medication therapy', 'Physiotherapy procedures', 'Nerve blocks']
    },
    arthrosis: {
      description: 'Conservative treatment of knee, hip and other joint arthrosis.',
      services: ['Consultation', 'Physiotherapy', 'Exercise and massage']
    },
    posture: {
      description: 'Diagnosis and correction of posture disorders.',
      services: ['Posture assessment', 'Exercises', 'Progress monitoring']
    },
    'block-injection': {
      description: 'Injection therapy for severe pain syndromes.',
      services: ['Paravertebral block', 'Intra-articular injections']
    },
    'rehab-trauma': {
      description: 'Recovery after spine and joint injuries.',
      services: ['Individual program', 'Gradual loading', 'Medical supervision']
    },
    'rehab-surgery': {
      description: 'Recovery after spine and joint surgery.',
      services: ['Early stage', 'Late stage', 'Outpatient rehabilitation']
    },
    'sports-rehab': {
      description: 'Return to training after musculoskeletal injuries.',
      services: ['Readiness assessment', 'Recovery program', 'Prevention']
    },
    'pediatric-spine': {
      description: 'Monitoring and treatment of posture disorders and scoliosis in children.',
      services: ['Examination', 'Therapeutic exercise', 'Brace correction']
    },
    'ultrasound-diag': {
      description: 'Ultrasound imaging of joints and soft tissues.',
      services: ['Joint ultrasound', 'Soft tissue ultrasound', 'Spine ultrasound']
    },
    xray: {
      description: 'X-ray imaging of spine and joints.',
      services: ['Spine X-ray', 'Joint X-ray', 'Functional images']
    },
    'mri-referral': {
      description: 'MRI referral and interpretation of results.',
      services: ['MRI referral', 'Results consultation']
    }
  }
};
