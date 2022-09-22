// Library imports
import React, { useState, useEffect, useRef, useMemo } from "react"
import { Box, Button, ButtonProps, Flex, Icon, Text } from "@chakra-ui/react"
import { useIntl } from "react-intl"
import { MdClose } from "react-icons/md"
import FocusTrap from "focus-trap-react"
// Component imports
import Translation from "./Translation"
import NakedButton from "./NakedButton"
// SVG imports
import FeedbackGlyph from "../assets/feedback-glyph.svg"
// Utility imports
import { trackCustomEvent } from "../utils/matomo"
import { translateMessageId } from "../utils/translations"
// Hook imports
import { useOnClickOutside } from "../hooks/useOnClickOutside"
import { useKeyPress } from "../hooks/useKeyPress"
import { useSurvey } from "../hooks/useSurvey"

interface FixedDotProps extends ButtonProps {
  bottomOffset: number
}
const FixedDot: React.FC<FixedDotProps> = ({
  children,
  bottomOffset,
  ...props
}) => {
  const size = "3rem"
  return (
    <NakedButton
      w={size}
      h={size}
      borderRadius="full"
      bgColor="primary"
      boxShadow="tableItemBox"
      position="sticky"
      bottom={{ base: `${bottomOffset + 1}rem`, lg: 4 }}
      ms="auto"
      mt={{ base: "150vh", lg: "inherit" }}
      insetEnd={4}
      zIndex={98} /* Below the mobile menu */
      display="flex"
      justifyContent="center"
      alignItems="center"
      _hover={{
        cursor: "pointer",
        transform: "scale(1.1)",
        transition: "transform 0.2s ease-in-out",
      }}
      transition="transform 0.2s ease-in-out"
      {...props}
    >
      {children}
    </NakedButton>
  )
}

interface FeedbackWidgetProps {
  location: string
}
const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ location = "" }) => {
  const intl = useIntl()
  const containerRef = useRef<HTMLInputElement>(null)
  useOnClickOutside(containerRef, () => handleClose(), [`mousedown`])
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false)
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null)

  useEffect(() => {
    // Reset component state when path (location) changes
    setIsOpen(false)
    setFeedbackSubmitted(false)
    setIsHelpful(null)
  }, [location])

  const surveyUrl = useSurvey(feedbackSubmitted, isHelpful)

  const bottomOffset = useMemo(() => {
    const pathsWithBottomNav = ["/staking", "/dao", "/defi", "/nft"]
    const CONDITIONAL_OFFSET = 6.75
    let offset = 0
    pathsWithBottomNav.forEach((path) => {
      if (location.includes(path)) {
        offset = CONDITIONAL_OFFSET
      }
    })
    return offset
  }, [location])

  const handleClose = (): void => {
    setIsOpen(false)
    trackCustomEvent({
      eventCategory: `FeedbackWidget toggled`,
      eventAction: `Clicked`,
      eventName: `Closed feedback widget`,
    })
  }
  const handleOpen = (): void => {
    setIsOpen(true)
    trackCustomEvent({
      eventCategory: `FeedbackWidget toggled`,
      eventAction: `Clicked`,
      eventName: `Opened feedback widget`,
    })
  }
  const handleSubmit = (choice: boolean): void => {
    trackCustomEvent({
      eventCategory: `Page is helpful feedback`,
      eventAction: `Clicked`,
      eventName: String(choice),
    })
    setIsHelpful(choice)
    setFeedbackSubmitted(true)
  }
  const handleSurveyOpen = (): void => {
    trackCustomEvent({
      eventCategory: `Feedback survey opened`,
      eventAction: `Clicked`,
      eventName: "Feedback survey opened",
    })
    window && surveyUrl && window.open(surveyUrl, "_blank")
    setIsOpen(false) // Close widget without triggering redundant tracker event
  }

  useKeyPress(`Escape`, handleClose)

  if (!location.includes("/en/")) return null
  const closeButtonSize = "24px"
  return (
    <>
      <FixedDot onClick={handleOpen} bottomOffset={bottomOffset} id="dot">
        <Icon as={FeedbackGlyph} color="white" h="32px" w="26px" />
      </FixedDot>
      {isOpen && (
        <Box
          display="block"
          position="fixed"
          inset={0}
          bgColor="blackAlpha.400"
          zIndex={1001} /* Above the nav bar */
        >
          <FocusTrap
            focusTrapOptions={{
              fallbackFocus: `#dot`,
            }}
          >
            <Flex
              id="modal"
              ref={containerRef}
              boxSizing="border-box"
              w={{ base: "auto", sm: "300px" }}
              bgColor="ednBackground"
              border="1px"
              borderColor="buttonColor"
              boxShadow="tableItemBox"
              borderRadius="base" /* 0.25rem */
              position="fixed"
              insetEnd={{ base: 4, sm: 8 }}
              insetStart={{ base: 4, sm: "auto" }}
              bottom={{ base: `${bottomOffset + 5}rem`, lg: 20 }}
              zIndex={1002} /* Above the modal background */
              _hover={{
                transform: "scale(1.02)",
                transition: "transform 0.2s ease-in-out",
              }}
              transition="transform 0.2s ease-in-out"
              direction="column"
              alignItems="center"
              textAlign="center"
              p={8}
            >
              <NakedButton
                onClick={handleClose}
                aria-label={translateMessageId("close", intl)}
                position="absolute"
                insetEnd={2}
                top={2}
                cursor="pointer"
                h={closeButtonSize}
                w={closeButtonSize}
                minW={closeButtonSize}
                minH={closeButtonSize}
                _hover={{
                  transform: "scale(1.1)",
                  transition: "transform 0.2s ease-in-out",
                }}
                transition="transform 0.2s ease-in-out"
              >
                <Icon as={MdClose} h={closeButtonSize} w={closeButtonSize} />
              </NakedButton>

              <Text fontWeight="bold" fontSize="xl" lineHeight={6}>
                {feedbackSubmitted ? (
                  <Translation id="feedback-widget-thank-you-title" />
                ) : (
                  <Translation id="feedback-widget-prompt" />
                )}
              </Text>
              {feedbackSubmitted && (
                <Text fontWeight="normal" fontSize="md" lineHeight={5}>
                  <Translation id="feedback-widget-thank-you-subtitle" />
                </Text>
              )}
              {feedbackSubmitted && (
                <Text
                  fontWeight="bold"
                  fontSize="xs"
                  lineHeight={4}
                  letterSpacing="wide"
                  color="searchBorder"
                >
                  <Translation id="feedback-widget-thank-you-timing" />
                </Text>
              )}
              <Flex flexWrap="nowrap" gap={6} width="full">
                {feedbackSubmitted ? (
                  <Button
                    variant="solid"
                    onClick={handleSurveyOpen}
                    aria-label={translateMessageId(
                      "feedback-widget-thank-you-cta",
                      intl
                    )}
                    flex={1}
                  >
                    <Translation id="feedback-widget-thank-you-cta" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="solid"
                      onClick={() => handleSubmit(true)}
                      aria-label={translateMessageId("yes", intl)}
                      flex={1}
                    >
                      <Translation id="yes" />
                    </Button>
                    <Button
                      variant="solid"
                      onClick={() => handleSubmit(false)}
                      aria-label={translateMessageId("no", intl)}
                      flex={1}
                    >
                      <Translation id="no" />
                    </Button>
                  </>
                )}
              </Flex>
            </Flex>
          </FocusTrap>
        </Box>
      )}
    </>
  )
}

export default FeedbackWidget
