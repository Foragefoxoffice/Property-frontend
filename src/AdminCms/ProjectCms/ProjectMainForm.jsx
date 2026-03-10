import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Spin, ConfigProvider } from 'antd';
import { ArrowLeft } from 'lucide-react';
import {
    getProjectById,
    createProject,
    updateProject,
    getProjectCategories,
} from '../../Api/action';
import { useLanguage } from '../../Language/LanguageContext';
import { CommonToaster } from '@/Common/CommonToaster';
import { translations } from '../../Language/translations';
import ProjectBannerForm from './ProjectBannerForm';
import ProjectIntroForm from './ProjectIntroForm';
import ProjectOverviewForm from './ProjectOverviewForm';
import ProjectLocationForm from './ProjectLocationForm';
import ProjectPhotosForm from './ProjectPhotosForm';
import ProjectProduct from './ProjectProduct';
import ProjectVideoForm from './ProjectVideoForm';
import ProjectGeneralForm from './ProjectGeneralForm';

export default function ProjectMainForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [generalForm] = Form.useForm();
    const [bannerForm] = Form.useForm();
    const [introForm] = Form.useForm();
    const [overviewForm] = Form.useForm();
    const [locationForm] = Form.useForm();
    const [photosForm] = Form.useForm();
    const [productForm] = Form.useForm();
    const [videoForm] = Form.useForm();

    const [projectData, setProjectData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mainImage, setMainImage] = useState('');

    const [openAccordions, setOpenAccordions] = useState({
        general: true,
        banner: false,
        intro: false,
        overview: false,
        location: false,
        photos: false,
        product: false,
        video: false,
    });

    const toggleAccordion = (key) => {
        setOpenAccordions(prev => ({
            general: key === 'general' ? !prev.general : false,
            banner: key === 'banner' ? !prev.banner : false,
            intro: key === 'intro' ? !prev.intro : false,
            overview: key === 'overview' ? !prev.overview : false,
            location: key === 'location' ? !prev.location : false,
            photos: key === 'photos' ? !prev.photos : false,
            product: key === 'product' ? !prev.product : false,
            video: key === 'video' ? !prev.video : false,
        }));
    };

    const [generalLoading, setGeneralLoading] = useState(false);
    const [bannerLoading, setBannerLoading] = useState(false);
    const [introLoading, setIntroLoading] = useState(false);
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);

    const { language } = useLanguage();
    const t = translations[language];
    const headerLang = language === 'vi' ? 'vn' : 'en';

    useEffect(() => {
        fetchCategories();
        if (id) {
            fetchProjectData();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await getProjectCategories();
            setCategories(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const response = await getProjectById(id);
            const project = response.data.data;

            if (project) {
                setProjectData(project);
                setMainImage(project.mainImage || '');

                generalForm.setFieldsValue({
                    title: project.title,
                    category: project.category?._id || project.category,
                    published: project.published,
                    projectMainDescription: project.projectMainDescription || { vi: '', en: '' }
                });

                bannerForm.setFieldsValue({
                    projectBannerTitle: project.projectBannerTitle,
                    projectBannerDesc: project.projectBannerDesc,
                });

                introForm.setFieldsValue({
                    projectIntroTitle: project.projectIntroTitle,
                    projectIntroContent: project.projectIntroContent,
                    mediaType: project.mediaType || 'image',
                    projectIntroVideo: project.projectIntroVideo,
                });

                overviewForm.setFieldsValue({
                    projectOverviewTitle: project.projectOverviewTitle,
                    projectOverviewTable: project.projectOverviewTable || [],
                });

                locationForm.setFieldsValue({
                    projectLocationTitle: project.projectLocationTitle,
                    projectLocationDes: project.projectLocationDes,
                });

                photosForm.setFieldsValue({
                    projectPhotoTitle: project.projectPhotoTitle,
                    projectPhotoTabs: project.projectPhotoTabs || [],
                });

                productForm.setFieldsValue({
                    projectProductTitle: project.projectProductTitle,
                    projectProductDes: project.projectProductDes,
                    projectProducts: project.projectProducts || [],
                });

                videoForm.setFieldsValue({
                    projectVideoTitle: project.projectVideoTitle,
                    projectVideoTabs: project.projectVideoTabs || [],
                });
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            CommonToaster(t.toastProjectDataFetchError, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getPayload = (currentValues) => {
        return {
            ...projectData,
            ...currentValues
        };
    };

    const handleGeneralSubmit = async (values, image) => {
        try {
            setGeneralLoading(true);
            const payload = { ...values, mainImage: image };

            if (id) {
                await updateProject(id, payload);
                CommonToaster(t.toastGeneralInfoUpdated, 'success');
                fetchProjectData();
            } else {
                const res = await createProject(payload);
                CommonToaster(t.toastProjectCreated, 'success');
                const newId = res.data.data._id;
                navigate(`/dashboard/cms/projects/edit/${newId}`);
            }
        } catch (error) {
            console.error('Submit Error:', error);
            CommonToaster(t.toastGeneralInfoSaveError, 'error');
        } finally {
            setGeneralLoading(false);
        }
    };

    const handleSectionSubmit = async (sectionValues, successMsg, setSectionLoading) => {
        if (!id) {
            CommonToaster(t.toastSaveGeneralFirst, 'warning');
            return;
        }
        try {
            setSectionLoading(true);
            const payload = getPayload(sectionValues);
            await updateProject(id, payload);
            CommonToaster(successMsg, 'success');
            fetchProjectData();
        } catch (error) {
            CommonToaster(t.toastSectionUpdateError, 'error');
        } finally {
            setSectionLoading(false);
        }
    };

    if (loading && !projectData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <ConfigProvider theme={{ token: { colorPrimary: '#41398B' } }}>
                    <Spin size="large" />
                </ConfigProvider>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between relative">
                <button
                    onClick={() => navigate('/dashboard/cms/projects')}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 text-gray-600 hover:text-[#41398B] rounded-xl shadow-sm hover:shadow-md transition-all font-semibold font-['Manrope']"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {t.backToList}
                </button>

                <h2 className="text-3xl font-bold font-['Manrope'] absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                    {id ? t.editProject : t.createProject}
                </h2>

                {/* Spacer for centering */}
                <div className="w-[140px] invisible md:block"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                <ProjectGeneralForm
                    form={generalForm}
                    categories={categories}
                    onSubmit={handleGeneralSubmit}
                    loading={generalLoading}
                    isOpen={openAccordions.general}
                    onToggle={() => toggleAccordion('general')}
                    headerLang={headerLang}
                    mainImage={mainImage}
                    setMainImage={setMainImage}
                />

                <ProjectBannerForm
                    form={bannerForm}
                    onSubmit={(values, images) => handleSectionSubmit({ ...values, projectBannerImages: images }, t.toastBannerUpdated, setBannerLoading)}
                    loading={bannerLoading}
                    pageData={projectData}
                    isOpen={openAccordions.banner}
                    onToggle={() => toggleAccordion('banner')}
                    headerLang={headerLang}
                />

                <ProjectIntroForm
                    form={introForm}
                    onSubmit={(values) => handleSectionSubmit(values, t.toastIntroUpdated, setIntroLoading)}
                    loading={introLoading}
                    pageData={projectData}
                    isOpen={openAccordions.intro}
                    onToggle={() => toggleAccordion('intro')}
                    headerLang={headerLang}
                />

                <ProjectOverviewForm
                    form={overviewForm}
                    onSubmit={(values, images) => handleSectionSubmit({ ...values, projectOverviewImages: images }, t.toastOverviewUpdated, setOverviewLoading)}
                    loading={overviewLoading}
                    pageData={projectData}
                    isOpen={openAccordions.overview}
                    onToggle={() => toggleAccordion('overview')}
                    headerLang={headerLang}
                />

                <ProjectLocationForm
                    form={locationForm}
                    onSubmit={(values, images) => handleSectionSubmit({ ...values, projectLocationImages: images }, t.toastLocationUpdated, setLocationLoading)}
                    loading={locationLoading}
                    pageData={projectData}
                    isOpen={openAccordions.location}
                    onToggle={() => toggleAccordion('location')}
                    headerLang={headerLang}
                />

                <ProjectPhotosForm
                    form={photosForm}
                    onSubmit={(values) => handleSectionSubmit(values, t.toastPhotosUpdated, setPhotosLoading)}
                    loading={photosLoading}
                    pageData={projectData}
                    isOpen={openAccordions.photos}
                    onToggle={() => toggleAccordion('photos')}
                    headerLang={headerLang}
                />

                <ProjectProduct
                    form={productForm}
                    onSubmit={(values) => handleSectionSubmit(values, t.toastProductsUpdated, setProductLoading)}
                    loading={productLoading}
                    pageData={projectData}
                    isOpen={openAccordions.product}
                    onToggle={() => toggleAccordion('product')}
                    headerLang={headerLang}
                />

                <ProjectVideoForm
                    form={videoForm}
                    onSubmit={(values) => handleSectionSubmit(values, t.toastVideosUpdated, setVideoLoading)}
                    loading={videoLoading}
                    pageData={projectData}
                    isOpen={openAccordions.video}
                    onToggle={() => toggleAccordion('video')}
                    headerLang={headerLang}
                />
            </div>
        </div>
    );
}
