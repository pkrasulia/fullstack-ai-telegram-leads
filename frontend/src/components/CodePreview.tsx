import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Copy } from 'lucide-react';

interface CodePreviewProps {
  code: string;
  language?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({
  code,
  language = 'typescript',
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="p-4">
      <pre
        className={`language-${language} rounded-md bg-gray-800 p-4 text-sm text-white`}
      >
        <code>{code}</code>
      </pre>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={copyToClipboard}
      >
        {isCopied ? (
          <>
            <Check className="mr-2 h-4 w-4" /> Скопировано
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" /> Копировать
          </>
        )}
      </Button>
    </Card>
  );
};

export default CodePreview;
