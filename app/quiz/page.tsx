"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Eye } from "lucide-react"

interface Question {
  id: number
  question: string
  choices: string[]
  correctAnswer: string
  userAnswer: string | null
  visited: boolean
  attempted: boolean
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 min * 60 sec
  const [email, setEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Load quiz data from localStorage
    const storedEmail = localStorage.getItem("quizEmail")
    const storedQuestions = localStorage.getItem("quizQuestions")
    const startTime = localStorage.getItem("quizStartTime")

    if (!storedEmail || !storedQuestions || !startTime) {
      router.push("/")
      return
    }

    setEmail(storedEmail)
    const parsedQuestions = JSON.parse(storedQuestions)
    setQuestions(parsedQuestions)

    // Calculate remaining time
    const elapsed = Math.floor((Date.now() - Number.parseInt(startTime)) / 1000)
    const remaining = Math.max(0, 30 * 60 - elapsed)
    setTimeLeft(remaining)

    // Mark first question as visited
    if (parsedQuestions.length > 0) {
      parsedQuestions[0].visited = true
      setQuestions([...parsedQuestions])
    }
  }, [router])

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitQuiz()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (answer: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestion].userAnswer = answer
    updatedQuestions[currentQuestion].attempted = true
    setQuestions(updatedQuestions)
    localStorage.setItem("quizQuestions", JSON.stringify(updatedQuestions))
  }

  const navigateToQuestion = (index: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index].visited = true
    setQuestions(updatedQuestions)
    setCurrentQuestion(index)
    localStorage.setItem("quizQuestions", JSON.stringify(updatedQuestions))
  }

  const handleSubmitQuiz = () => {
    localStorage.setItem("quizCompleted", "true")
    router.push("/results")
  }

  if (questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">CausalFunnel Quiz</h1>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
            <div className="flex items-center gap-2 text-lg font-mono">
              <Clock className="w-5 h-5" />
              <span className={timeLeft < 300 ? "text-red-600" : "text-gray-900"}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                  {questions.map((q, index) => (
                    <Button
                      key={q.id}
                      variant={currentQuestion === index ? "default" : "outline"}
                      size="sm"
                      className="relative h-10 w-10 p-0"
                      onClick={() => navigateToQuestion(index)}
                    >
                      {index + 1}
                      <div className="absolute -top-1 -right-1 flex gap-0.5">
                        {q.visited && <Eye className="w-3 h-3 text-blue-500" />}
                        {q.attempted && <CheckCircle className="w-3 h-3 text-green-500" />}
                      </div>
                    </Button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3 text-blue-500" />
                    <span>Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Attempted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Question {currentQuestion + 1} of {questions.length}
                  </CardTitle>
                  <Badge variant={currentQ.attempted ? "default" : "secondary"}>
                    {currentQ.attempted ? "Answered" : "Not Answered"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQ.question }} />

                <RadioGroup value={currentQ.userAnswer || ""} onValueChange={handleAnswerChange} className="space-y-3">
                  {currentQ.choices.map((choice, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                      <RadioGroupItem value={choice} id={`choice-${index}`} />
                      <Label
                        htmlFor={`choice-${index}`}
                        className="flex-1 cursor-pointer"
                        dangerouslySetInnerHTML={{ __html: choice }}
                      />
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigateToQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {currentQuestion < questions.length - 1 ? (
                      <Button onClick={() => navigateToQuestion(currentQuestion + 1)}>Next</Button>
                    ) : (
                      <Button onClick={handleSubmitQuiz} className="bg-green-600 hover:bg-green-700">
                        Submit Quiz
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


// Main files are app/page.tsx, app/api/questions , app/quiz , app/results 