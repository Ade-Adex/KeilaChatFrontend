import { Button, Code, CopyButton, Group, Stack } from '@mantine/core'
import React from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'

interface CodeSnippetProps {
  code: string
  copyValue: string
}

const CodeSnippet = ({ code, copyValue }: CodeSnippetProps) => {
  return (
    <CopyButton value={copyValue} timeout={2500}>
      {({ copied, copy }) => (
        <Stack gap="xs">
          <div className="relative group">
            <Code
              block
              className="
                p-5
                rounded-lg
                overflow-x-auto
                whitespace-pre-wrap
                break-all
                text-sm
                leading-7
                font-mono
                bg-card!
                border
                border-border!
                text-foreground!
              "
            >
              {code}
            </Code>
          </div>

          <Group justify="flex-end">
            <Button
              size="xs"
              variant={copied ? 'filled' : 'light'}
              color={copied ? 'teal' : 'blue'}
              leftSection={
                copied ? <FiCheck size={14} /> : <FiCopy size={14} />
              }
              onClick={copy}
            >
              {copied ? 'Snippet Copied' : 'Copy Snippet'}
            </Button>
          </Group>
        </Stack>
      )}
    </CopyButton>
  )
}

export default CodeSnippet
