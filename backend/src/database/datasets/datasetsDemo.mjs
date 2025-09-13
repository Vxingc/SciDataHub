import { addDataset, initDatasetTable, deleteDatasetTable } from './datasetsTable.mjs';
import { generateIPFSCID, randStr, hash } from '../../utils/utils.mjs';
import logger from '../../utils/log.mjs';

const HashList = [
    '822a5f5e4d0d8455397d757cc661c67160a8ac7e5e91533832c45acb5b657b76',
    '3241c39511b4abbd22eb82c86839996d51f3cb7497c9fbab44491fe772eaed22',
    '8a9e2ebf763531a6d28da34a01976d3ed393be0b98e3ff4310d492f1f1cfaff4',
    'bd84a6cfb79adfb3c1a2a5cd496e613b23c16a88f3fa87165d6da3ca17b98688',
    '991b22a282592412804e0893d4ec155f930a7edc1b5e595794a16deb02e9d6d3',
    '751f3b68bb5d8b1c8b9ba439307e9d515d1813ec755240be44bbd549dca530c9',
    '160c8267dcf84a4bada2f74503319cf0b8b7162cfb43e27d974568eca0451e89',
    'c5e4347ad503d184e9a15836bc33b450d465486aa907e8918b0a17864f1d978e',
    '0a1bb72f403014af6f77fb935c5a6245f15320f5c531b7f4f327d6469cd94ca4',
    '74dc9bf8b4b5404fcbd8d68bd71dcc72f2e74e11ca5b2d003f30df13b0ed007b',
    '32facf9051a4b40323115e9cb683956edcb337b10c129308a83b2d9298676e54',
    '653b20ee85c9158f3096f7ef4f36ca7e23dd99ce8d9bc53bd860ae99120d5ac1',
    '4fcf03fee3c20ad9531355c5f94895f86782ff8ededd1a523776178133773898',
    'e86c0e58e5fbd459d741d29489e9c338d92e812d6de50e4a39999bdc2b912722',
    'e5495814efbcc8f153e38b4353985447f3720fb56a64768ad00854c39fb566bb',
    'ee92ea5b3e5b1e53c58c23f5a9293cf647b7a258378d258ced5229cc26ef33b8',
    '67ecaba6a9937da257ab7ac9b82ddbede83eed4fe1e247233593bb714e86aab5',
    'a30c7378cfb66a6d09691d12e3927e3cc8bb2cc91710589358dca1f99ab44111',
    '799081ae12206764821a4084318cf448abc546f7780d2cf8c6971b7071a39d50',
    'ad16f90aca34b9438d1a4efb708fd9eb7eaf65d48ef2313cac40ad4e0478a0a0',
    '3e09b7e71c53a7f3cab08f455a979e45b8d9a103e658c2c00fc7a135aece8e7d',
    '3be127ef5fb16ad0646d51356e225e33f16516994f84e3634ec8cf1af41dd541',
    'a8e9fc3016d89f5efbe379642d792795d218072346d09b01ba38960f93514ba4',
    'ada41bc42814b8df18ea65842fe3bc536b57968bf5123004294cf4c1a3cde164',
    'ea7cd165efab5979574370d5558a090848f225809e516f2e165f4bd5fdf2cb3a',
];

export async function addDemoDatasets() {
    try {
        await deleteDatasetTable('Physics');
        await deleteDatasetTable('Biology');
        await deleteDatasetTable('Medicine');
        await deleteDatasetTable('ArtificialIntelligence');
        await deleteDatasetTable('CyberSecurity');

        await initDatasetTable('Physics');
        await initDatasetTable('Biology');
        await initDatasetTable('Medicine');
        await initDatasetTable('ArtificialIntelligence');
        await initDatasetTable('CyberSecurity');

        // Physics 物理学数据集
        await addDataset('Physics', 'quantum_mechanics', '量子力学实验数据集', '包含量子态测量、量子纠缠和量子隧道效应的实验数据，用于量子物理研究和量子计算开发', 'demoDataOwner', true, true, true, true, HashList[0], await generateIPFSCID());
        await addDataset('Physics', 'particle_physics', '粒子物理碰撞数据', '高能粒子对撞实验数据，包含希格斯玻色子、夸克和轻子的探测记录，支持标准模型验证研究', 'demoDataOwner', true, true, true, false, HashList[1], await generateIPFSCID());
        await addDataset('Physics', 'astrophysics', '天体物理观测数据', '包含恒星光谱、星系红移、引力波信号等天文观测数据，用于宇宙学和相对论研究', 'demoDataOwner', true, true, false, false, HashList[2], await generateIPFSCID());
        await addDataset('Physics', 'plasma_physics', '等离子体物理数据', '托卡马克装置、激光等离子体相互作用的实验数据，用于核聚变和等离子体控制研究', 'demoDataOwner', true, true, false, true, HashList[3], await generateIPFSCID());
        await addDataset('Physics', 'optics_photonics', '光学与光子学数据', '激光物理、非线性光学、量子光学实验数据，包含光子纠缠和光学器件特性测量', 'demoDataOwner', true, false, true, false, HashList[4], await generateIPFSCID());

        // Biology 生物学数据集
        await addDataset('Biology', 'genomics', '基因组学数据集', '包含人类、动植物基因组序列、基因表达谱和遗传变异数据，支持进化生物学和疾病基因研究', 'demoDataOwner', true, true, true, true, HashList[5], await generateIPFSCID());
        await addDataset('Biology', 'proteomics', '蛋白质组学数据', '蛋白质结构、功能域、相互作用网络数据，用于药物靶点发现和蛋白质工程研究', 'demoDataOwner', true, true, true, false, HashList[6], await generateIPFSCID());
        await addDataset('Biology', 'cell_biology', '细胞生物学影像数据', '细胞分裂、凋亡、信号转导的显微镜影像和时间序列数据，支持细胞机制研究', 'demoDataOwner', true, true, false, false, HashList[7], await generateIPFSCID());
        await addDataset('Biology', 'neurobiology', '神经生物学数据', '神经元活动记录、脑电图、神经网络连接图谱，支持认知科学和神经疾病研究', 'demoDataOwner', true, true, false, true, HashList[8], await generateIPFSCID());
        await addDataset('Biology', 'microbiology', '微生物学数据集', '细菌、病毒、真菌的基因组、代谢途径和抗药性数据，用于感染病学和生物技术研究', 'demoDataOwner', true, false, true, false, HashList[9], await generateIPFSCID());

        // Medicine 临床医学数据集
        await addDataset('Medicine', 'clinical_trials', '临床试验数据集', '药物临床试验的疗效、安全性、不良反应数据，支持循证医学和药物开发研究', 'demoDataOwner', true, true, true, true, HashList[10], await generateIPFSCID());
        await addDataset('Medicine', 'medical_imaging', '医学影像数据库', 'CT、MRI、X光、超声等医学影像及诊断标注，用于影像诊断和计算机辅助诊断研究', 'demoDataOwner', true, true, true, false, HashList[11], await generateIPFSCID());
        await addDataset('Medicine', 'electronic_health', '电子健康记录数据', '去标识化的患者病历、检验结果、用药记录，支持临床决策支持和健康信息学研究', 'demoDataOwner', true, true, false, false, HashList[12], await generateIPFSCID());
        await addDataset('Medicine', 'epidemiology', '流行病学调查数据', '疾病发病率、传播模式、危险因素的流行病学调查数据，支持公共卫生政策制定', 'demoDataOwner', true, true, false, true, HashList[13], await generateIPFSCID());
        await addDataset('Medicine', 'biomarkers', '生物标志物数据集', '疾病诊断、预后评估的分子标志物数据，包含蛋白质、代谢物和基因表达标志物', 'demoDataOwner', true, false, true, false, HashList[14], await generateIPFSCID());

        // ArtificialIntelligence 人工智能数据集
        await addDataset('ArtificialIntelligence', 'computer_vision', '计算机视觉数据集', '图像分类、目标检测、语义分割的标注数据集，支持深度学习和计算机视觉算法研究', 'demoDataOwner', true, true, true, true, HashList[15], await generateIPFSCID());
        await addDataset('ArtificialIntelligence', 'natural_language', '自然语言处理语料', '多语言文本语料、情感分析、机器翻译的标注数据，用于NLP模型训练和评估', 'demoDataOwner', true, true, true, false, HashList[16], await generateIPFSCID());
        await addDataset('ArtificialIntelligence', 'speech_recognition', '语音识别数据集', '多说话人、多语言、多场景的语音数据及转录文本，支持语音技术和对话系统研究', 'demoDataOwner', true, true, false, false, HashList[17], await generateIPFSCID());
        await addDataset('ArtificialIntelligence', 'knowledge_graphs', '知识图谱数据集', '实体关系、本体结构、知识推理的结构化数据，支持知识表示和推理系统研究', 'demoDataOwner', true, true, false, true, HashList[18], await generateIPFSCID());
        await addDataset('ArtificialIntelligence', 'multimodal_learning', '多模态学习数据', '图像-文本、视频-音频等多模态配对数据，用于跨模态理解和生成模型研究', 'demoDataOwner', true, false, true, false, HashList[19], await generateIPFSCID());

        // CyberSecurity 网络安全数据集
        await addDataset('CyberSecurity', 'network_intrusion', '网络入侵检测数据', '网络流量、攻击行为、异常检测的标注数据集，用于入侵检测系统和网络安全研究', 'demoDataOwner', true, true, true, true, HashList[20], await generateIPFSCID());
        await addDataset('CyberSecurity', 'malware_analysis', '恶意软件分析数据', '恶意软件样本、行为特征、家族分类数据，支持恶意软件检测和逆向工程研究', 'demoDataOwner', true, true, true, false, HashList[21], await generateIPFSCID());
        await addDataset('CyberSecurity', 'vulnerability_database', '漏洞数据库', '软件漏洞、CVE记录、补丁信息的结构化数据，用于漏洞管理和安全评估研究', 'demoDataOwner', true, true, false, false, HashList[22], await generateIPFSCID());
        await addDataset('CyberSecurity', 'cryptography', '密码学测试数据集', '加密算法、密钥管理、数字签名的测试向量和安全性评估数据', 'demoDataOwner', true, true, false, true, HashList[23], await generateIPFSCID());
        await addDataset('CyberSecurity', 'security_logs', '安全日志分析数据', '系统日志、安全事件、威胁情报的时间序列数据，用于安全运营和威胁狩猎研究', 'demoDataOwner', true, false, true, false, HashList[24], await generateIPFSCID());

        logger.debug('成功添加所有专业数据集');
    } catch (error) {
        logger.error('添加默认数据集失败:', error);
    }
};
