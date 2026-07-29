import { Button } from "antd";
import { useTranslation } from "react-i18next";

/** Landing placeholder — scaffolding home page (replaced by the real dashboard later). */
const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">{t("appName")}</h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
      <Button type="primary" className="mt-4">
        {t("start")}
      </Button>
    </div>
  );
};

export default Home;
